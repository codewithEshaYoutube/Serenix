#!/bin/bash
set -e

# nvinfer serializes the TensorRT engine next to the ONNX file (it ignores
# model-engine-file for writing), so copy the ONNX into the /engines volume —
# that's what makes the engine survive container restarts.
cp -f /models/*.onnx /engines/
cp -f /custom/*.onnx /engines/ 2>/dev/null || true

# Drop the image's CUDA forward-compat libs (they break on hosts with older
# drivers, e.g. 580 vs the baked-in 590 -> CUDA error 804; harmless elsewhere).
rm -f /etc/ld.so.conf.d/*compat*.conf
ldconfig

# -t draws label text on the OSD (test5-app never draws it otherwise).
exec deepstream-test5-app -c /configs/ds_yolo_mqtt.txt -t
