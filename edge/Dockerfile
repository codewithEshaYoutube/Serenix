# Stage 1 — export YOLO11n to ONNX (CPU-only; no GPU needed at build time)
FROM python:3.11-slim AS export
RUN apt-get update && apt-get install -y --no-install-recommends git curl \
    && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir ultralytics onnx onnxscript onnxslim onnxruntime \
    # slim image has no X libs; swap opencv for the headless build
    && pip uninstall -y opencv-python \
    && pip install --no-cache-dir opencv-python-headless
ARG DSYOLO_COMMIT=2894babce8e75c49115dbe0c7b516289ed853565
RUN git clone https://github.com/marcoslucianops/DeepStream-Yolo /DeepStream-Yolo \
    && git -C /DeepStream-Yolo checkout ${DSYOLO_COMMIT}
WORKDIR /DeepStream-Yolo
RUN curl -fL -o yolo11n.pt https://github.com/ultralytics/assets/releases/download/v8.3.0/yolo11n.pt
# --dynamic: dynamic batch so batch-size=4 works; --simplify: required for DS >= 6.0
RUN python utils/export_yolo11.py -w yolo11n.pt --dynamic --simplify

# Stage 2 — compile the custom YOLO bbox parser (the samples image ships no
# nvcc/CUDA headers, so install them here and keep them out of the final image)
FROM nvcr.io/nvidia/deepstream:9.0-samples-multiarch AS parser
RUN apt-get update && apt-get install -y --no-install-recommends \
    cuda-nvcc-13-1 cuda-cudart-dev-13-1 && rm -rf /var/lib/apt/lists/* \
    # linker needs the dev symlink; libcublas-dev conflicts with the image's
    # pinned runtime version, but the runtime .so is all the link needs
    && ln -s "$(ls /usr/local/cuda-13.1/lib64/libcublas.so.* | head -1)" /usr/local/cuda-13.1/lib64/libcublas.so
COPY --from=export /DeepStream-Yolo/nvdsinfer_custom_impl_Yolo /opt/DeepStream-Yolo/nvdsinfer_custom_impl_Yolo
# DS 9.0 added rotation_angle (OBB) to NvDsInferParseObjectInfo; the parser
# predates it and leaves the field uninitialized -> boxes render tilted by
# random angles. Zero-init the struct.
RUN cd /opt/DeepStream-Yolo/nvdsinfer_custom_impl_Yolo \
    && sed -i 's/NvDsInferParseObjectInfo b;/NvDsInferParseObjectInfo b = {};/' nvdsparsebbox_Yolo.cpp \
    && grep -q 'NvDsInferParseObjectInfo b = {};' nvdsparsebbox_Yolo.cpp \
    && CUDA_VER=13.1 make

# Stage 3 — runtime
FROM nvcr.io/nvidia/deepstream:9.0-samples-multiarch
COPY --from=parser /opt/DeepStream-Yolo/nvdsinfer_custom_impl_Yolo/libnvdsinfer_custom_impl_Yolo.so /opt/DeepStream-Yolo/nvdsinfer_custom_impl_Yolo/libnvdsinfer_custom_impl_Yolo.so
COPY --from=export /DeepStream-Yolo/yolo11n.onnx /DeepStream-Yolo/labels.txt /models/
COPY --chmod=755 entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
