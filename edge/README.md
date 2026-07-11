# edge — DeepStream + YOLO11 + MQTT

Demo pipeline: 4 video streams -> YOLO11n (batch 4, FP16) -> tracker -> 2x2 tiled
view with boxes/labels, published three ways: JSON events on MQTT, a live RTSP
stream, and an annotated output video.

## Run it

1. Fetch the 4 demo videos (free construction-site clips from
   [Mixkit](https://mixkit.co/license/), ~50 MB total — `videos/` is gitignored):

   ```sh
   cd videos
   curl -L -o construction_14729.mp4 https://assets.mixkit.co/videos/14729/14729-720.mp4
   curl -L -o construction_32296.mp4 https://assets.mixkit.co/videos/32296/32296-720.mp4
   curl -L -o construction_23170.mp4 https://assets.mixkit.co/videos/23170/23170-720.mp4
   curl -L -o construction_49192.mp4 https://assets.mixkit.co/videos/49192/49192-720.mp4
   cd ..
   ```

   (Any H.264 mp4s work — just point the `[sourceN]` `uri=` lines in
   `configs/ds_yolo_mqtt.txt` at your files.)

2. `docker compose up --build` — the first run builds the TensorRT engine
   (~2 min, cached in the `engines` volume; later runs start in seconds), then
   per-stream `**PERF` FPS lines appear.

## Watch the output

- **Live view (demo):** open `rtsp://localhost:8554/ds-test` in VLC, or:

  ```sh
  ffplay -rtsp_transport tcp rtsp://localhost:8554/ds-test
  ```

- **Detection events:**

  ```sh
  mosquitto_sub -h localhost -t ds/detections
  ```

- **Output video:** written to `out/output.mkv` (overwritten each run; grows
  until you stop the stack since the sources loop forever). Stop with
  `docker compose down` — the stack shuts down gracefully so the file is
  finalized.

## Use a finetuned YOLO11 model

1. Export your `.pt` to ONNX (also writes `labels.txt` from your model's
   classes) using the exporter already baked into the build:

   ```sh
   docker build --target export -t edge-export .
   docker run --rm -v ./models:/m -w /m edge-export \
     python /DeepStream-Yolo/utils/export_yolo11.py -w mymodel.pt --dynamic --simplify
   ```

   This leaves `models/mymodel.onnx` and `models/labels.txt` next to your `.pt`.
   (`--dynamic` is required — the pipeline runs batch-size 4.)

2. Point `configs/config_infer_primary_yolo11.txt` at it:

   ```ini
   onnx-file=/engines/mymodel.onnx
   model-engine-file=/engines/mymodel.onnx_b4_gpu0_fp16.engine
   labelfile-path=/custom/labels.txt
   num-detected-classes=<your class count>
   ```

   (`models/` on the host is mounted at `/custom` in the container; the
   entrypoint copies any ONNX found there into `/engines`.)

3. Rebuild the engine cache and start:

   ```sh
   docker compose down -v && docker compose up
   ```

   First start builds a new TensorRT engine for your model (~2 min), then MQTT
   events, the RTSP stream, and the output video all use your classes.
