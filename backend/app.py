import geopandas as gpd
from flask import request
from flask import Flask
import pandas as pd
import pickle
from datetime import datetime
from shapely.wkt import loads
from shapely.geometry import box
import time

app = Flask(__name__)

CACHE = {
    "gdf": None,
    "timestamp": None
}

CACHE_TTL = 300  # seconds (5 minutes)

encoder_path = r'Accident-_Risk_System/backend/encoderv1.pkl'
model_path = r'Accident-_Risk_System/backend/modelv1.pkl'

with open(model_path, 'rb') as f:
    modelv1 = pickle.load(f)

with open(encoder_path, 'rb') as f:
    encoderv1 = pickle.load(f)

def compute_full_gdf():
    model_df = pd.read_csv("model_df.csv")

    curr_time = datetime.now()
    model_df["hour"] = curr_time.hour
    model_df["weekday"] = curr_time.weekday()

    X = model_df.drop(columns=[
        "accident_count",
        "risk_score",
        "avg_severity",
        "total_casualties",
        "total_vehicles",
        "predicted_risk",
        "geometry"
    ])

    X["grid_id_encoded"] = encoderv1.transform(X["grid_id"])
    X = X.drop(columns="grid_id")

    model_df["predicted_risk"] = modelv1.predict(X)
    model_df["geometry"] = model_df["geometry"].apply(loads)

    gdf = gpd.GeoDataFrame(model_df, geometry="geometry", crs="EPSG:4326")

    # early filtering
    gdf = gdf[gdf.predicted_risk >= 0.3]

    return gdf

def get_cached_gdf():
    now = time.time()

    if (
        CACHE["gdf"] is None 
        or CACHE["timestamp"] is None 
        or now - CACHE['timestamp'] > CACHE_TTL):
        CACHE["gdf"] = compute_full_gdf()
        CACHE["timestamp"] = now

    return CACHE["gdf"]


def generate_hotspots(minLat, minLng, maxLat, maxLng, zoom):
    gdf = get_cached_gdf()

    bbox = box(minLng, minLat, maxLng, maxLat)
    subset = gdf[gdf.intersects(bbox)]

    tolerance = 0.001 if zoom < 10 else 0.0003
    subset = subset.copy()
    subset["geometry"] = subset.geometry.simplify(
        tolerance, preserve_topology=True
    )

    return subset.to_json()



@app.route('/hotspots', methods=['GET'])
def hotspots():
    minLat = float(request.args.get("minLat"))
    minLng = float(request.args.get("minLng"))
    maxLat = float(request.args.get("maxLat"))
    maxLng = float(request.args.get("maxLng"))
    zoom   = int(request.args.get("zoom"))

    geojson = generate_hotspots(minLat, minLng, maxLat, maxLng, zoom)
    return app.response_class(
        response=geojson,
        status=200,
        mimetype='application/json'
    )


if __name__ == '__main__':
    app.run(debug=True)
