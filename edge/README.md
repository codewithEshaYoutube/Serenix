# edge — DeepStream + YOLO11 + MQTT

Demo pipeline: 4 video streams -> YOLO11n (batch 4, FP16) -> tracker -> 2x2 tiled
view with boxes/labels, published three ways: JSON events on MQTT, a live RTSP
stream, and an annotated output video.

## Run it

1. Put 4 H.264 mp4s at `videos/construction_1.mp4` … `construction_4.mp4`
   (`videos/` is gitignored). Free stock sites like [Pexels](https://www.pexels.com/videos/),
   [Pixabay](https://pixabay.com/videos/), or [Mixkit](https://mixkit.co/) have
   plenty of construction-site clips. Different filenames? Point the
   `[sourceN]` `uri=` lines in `configs/ds_yolo_mqtt.txt` at your files.

2. Start the stack (from this `edge/` directory) and watch the logs:

   ```sh
   docker compose up --build -d
   docker compose logs -f deepstream
   ```

   The very first run builds the Docker image (~10 min) and then the TensorRT
   engine (~2 min, cached in the `engines` volume — later runs start in
   seconds). The pipeline is running once per-stream `**PERF` FPS lines appear
   in the logs. `Ctrl+C` only detaches from the logs; the stack keeps running.

## Watch the output

- **Live view (demo):**

  ```sh
  ffplay -rtsp_transport tcp rtsp://localhost:8554/ds-test
  ```

  Expect a few seconds of `non-existing PPS` / `no frame!` warnings while
  ffplay waits for the next keyframe — the window opens right after. VLC
  works too: Media > Open Network Stream > `rtsp://localhost:8554/ds-test`.

- **Detection events:** subscribe from the host using the client already
  inside the broker container (nothing to install):

  ```sh
  docker exec edge-mosquitto-1 mosquitto_sub -t ds/detections
  ```

  One JSON event per detected object per frame. If you'd rather have a native
  client: `sudo apt install mosquitto-clients`, then
  `mosquitto_sub -h localhost -t ds/detections`.

- **Output video:** `out/output.mkv` never "finishes" on its own — the
  sources loop forever, so it grows until you stop the stack. Record as long
  as you want, then:

  ```sh
  docker compose down
  ```

  This shuts the pipeline down gracefully and finalizes the file; play
  `out/output.mkv` afterwards. It is overwritten on the next start, so copy
  it elsewhere if you want to keep it.

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
