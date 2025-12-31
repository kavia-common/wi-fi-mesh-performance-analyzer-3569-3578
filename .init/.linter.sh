#!/bin/bash
cd /home/kavia/workspace/code-generation/wi-fi-mesh-performance-analyzer-3569-3578/frontend_dashboard
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

