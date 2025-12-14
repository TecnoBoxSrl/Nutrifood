# NUTRI‑FOOD — Sito statico (GitHub Pages)
## 1) Pubblicazione su GitHub Pages
Settings → Pages → Source = Branch `main` / root. In Custom domain: `www.nutri-food.it` → Save.
## 2) DNS Aruba
A (apex): 185.199.108.153 / .109.153 / .110.153 / .111.153
AAAA (apex): 2606:50c0:8000::153 / ::8001::153 / ::8002::153 / ::8003::153
CNAME: `www` → `<user>.github.io.`
## 3) HTTPS
Settings → Pages → Enforce HTTPS.
## 4) Contenuti
 Modifica `data/products.json` per aggiornare prodotti e ricette.
