
# get all teas from pages/teas directory the slug is *.md
# ensure each tea has an entry in tea-stock.json with the same slug
# if not, add an entry with status "skladem", amountGrams 1000, thresholdGrams 150, updatedAt today, priceBowl 100, pricePerInfusion 150, priceGongfu 400
import json
import os
from datetime import datetime

def get_tea_slugs():
    tea_slugs = []
    for filename in os.listdir("src/pages/teas"):
        if filename.endswith(".md"):
            slug = filename[:-3]
            tea_slugs.append(slug)
    return tea_slugs

def load_tea_stock():
    with open("src/data/tea-stock.json", "r") as f:
        tea_stock = json.load(f)
    return tea_stock

def save_tea_stock(tea_stock):
    with open("src/data/tea-stock.json", "w") as f:
        json.dump(tea_stock, f, indent=2)

def main():
    tea_slugs = get_tea_slugs()
    tea_stock = load_tea_stock()
    tea_stock_slugs = [entry["slug"] for entry in tea_stock]

    for slug in tea_slugs:
        if slug not in tea_stock_slugs:
            new_entry = {
                "slug": slug,
                "status": "skladem",
                "amountGrams": 1000,
                "thresholdGrams": 150,
                "updatedAt": datetime.now().strftime("%Y-%m-%d"),
                "price": 1,
                "discountPercent": 0
            }
            tea_stock.append(new_entry)

    save_tea_stock(tea_stock)


if __name__ == "__main__":
    main()
