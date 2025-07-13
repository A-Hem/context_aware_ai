#!/bin/bash

set -e

echo "--- Creating Context-Aware Weather Specialist Model ---"
ollama create weather-context-aware -f modelfiles/weather_specialist.Modelfile

echo "--- Creating Context-Aware Tech Specialist Model ---"
ollama create tech-context-aware -f modelfiles/tech_specialist.Modelfile

echo "--- Creating Evidence Triage Agent Model ---"
ollama create evidence-triage-agent -f modelfiles/evidence_triage.Modelfile

echo "--- Creating PRNU Analysis Agent Model ---"
ollama create prnu-analysis-agent -f modelfiles/prnu_analysis.Modelfile

echo "--- Creating Forensic Reporting Agent Model ---"
ollama create forensic-report-agent -f modelfiles/forensic_report.Modelfile

echo "--- Verifying Models ---"
ollama list | grep -E "weather-context-aware|tech-context-aware|evidence-triage-agent|prnu-analysis-agent|forensic-report-agent"

echo "--- All context-aware models created successfully! ---"
