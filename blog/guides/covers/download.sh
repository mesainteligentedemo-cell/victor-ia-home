#!/bin/bash
mkdir -p .

# Download and save as webp
curl -s "https://d8j0ntlcm91z4.cloudfront.net/user_2xDKzgUHSbZ2WsUfnTEP222ovTJ/hf_20260602_055216_c4313ced-cdc5-4e95-9ee8-1f281cad832c_min.webp" -o "ia-hoteles-resorts.webp" && echo "[OK] Hoteles"
curl -s "https://d8j0ntlcm91z4.cloudfront.net/user_2xDKzgUHSbZ2WsUfnTEP222ovTJ/hf_20260602_055221_bb851c85-c905-4657-b302-e9a0afccb893_min.webp" -o "ia-restaurantes-bares.webp" && echo "[OK] Restaurantes"
curl -s "https://d8j0ntlcm91z4.cloudfront.net/user_2xDKzgUHSbZ2WsUfnTEP222ovTJ/hf_20260602_055235_c43fea9d-1062-49bc-963f-8e7a9c4c1211_min.webp" -o "ia-agencias-viajes-tours.webp" && echo "[OK] Agencias"
curl -s "https://d8j0ntlcm91z4.cloudfront.net/user_2xDKzgUHSbZ2WsUfnTEP222ovTJ/hf_20260602_055241_ce7759bb-3362-4461-bdce-608beca4ceed_min.webp" -o "ia-timeshare-propiedad-fraccionada.webp" && echo "[OK] Timeshare"
curl -s "https://d8j0ntlcm91z4.cloudfront.net/user_2xDKzgUHSbZ2WsUfnTEP222ovTJ/hf_20260602_055250_1e290c83-af8a-4fda-8f66-604efc9d6a67_min.webp" -o "ia-parques-atracciones.webp" && echo "[OK] Parques"
curl -s "https://d8j0ntlcm91z4.cloudfront.net/user_2xDKzgUHSbZ2WsUfnTEP222ovTJ/hf_20260602_055255_392f4ce6-f143-4a6d-bf82-10e577aec42b_min.webp" -o "ia-condominios-rental-vacacional.webp" && echo "[OK] Condominios"
curl -s "https://d8j0ntlcm91z4.cloudfront.net/user_2xDKzgUHSbZ2WsUfnTEP222ovTJ/hf_20260602_055312_a48bb948-9b72-4c1e-87e2-02b489509374_min.webp" -o "ia-inmobiliarias-constructoras.webp" && echo "[OK] Inmobiliarias"
curl -s "https://d8j0ntlcm91z4.cloudfront.net/user_2xDKzgUHSbZ2WsUfnTEP222ovTJ/hf_20260602_055339_f058677b-b149-4889-850c-89869f6ce581_min.webp" -o "ia-logistica-supply-chain-turistico.webp" && echo "[OK] Logistica"

ls -lh *.webp
