# edge — DeepStream + YOLO11n + MQTT

Headless demo: 4 video streams -> YOLO11n (batch 4, FP16) -> tracker -> JSON events on MQTT.

1. Put a video at `videos/videos.mp4`. No video handy? Grab the DeepStream sample:

   ```sh
   docker run --rm -v ./videos:/out nvcr.io/nvidia/deepstream:9.0-samples-multiarch \
     cp /opt/nvidia/deepstream/deepstream/samples/streams/sample_1080p_h264.mp4 /out/videos.mp4
   ```

2. `docker compose up --build` — first run exports ONNX + builds the TensorRT engine (~1–3 min), then per-stream PERF FPS lines appear.

3. Watch the detections:

   ```sh
   mosquitto_sub -h localhost -t ds/detections
   ```

The TensorRT engine is cached in the `engines` volume. If you swap the model, drop the stale cache: `docker compose down -v`.
