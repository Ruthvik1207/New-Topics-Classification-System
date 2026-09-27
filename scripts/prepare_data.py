#!/usr/bin/env python3
"""
Data Preparation Script for NewsLens AI
Generates a comprehensive dataset of news articles across 8 categories:
1. World
2. Politics
3. Business
4. Technology
5. Science
6. Health
7. Sports
8. Entertainment

Outputs:
- data/raw/news.csv (raw dataset)
- data/processed/train.csv, val.csv, test.csv
- data/reference/reference_dataset.csv (baseline reference data for Evidently drift detection)
"""

import os
import csv
import random
from typing import List, Tuple

RAW_DATA_PATH = os.path.join("data", "raw", "news.csv")
PROCESSED_DIR = os.path.join("data", "processed")
REFERENCE_PATH = os.path.join("data", "reference", "reference_dataset.csv")

CATEGORIES = [
    "World",
    "Politics",
    "Business",
    "Technology",
    "Science",
    "Health",
    "Sports",
    "Entertainment"
]

SAMPLE_ARTICLES = [
    # World
    ("United Nations delegates convene in Geneva for high-stakes climate negotiations following unprecedented heatwaves across multiple continents.", "World"),
    ("European diplomatic leaders forge emergency humanitarian corridor agreement after months of regional cross-border border skirmishes.", "World"),
    ("Pacific island alliance submits binding maritime boundary treaty to the International Court of Justice.", "World"),
    ("Global trade ministers assemble for the multilateral economic summit to address international shipping lane disruptions.", "World"),
    ("Disaster response teams deploy to Southeast Asia as severe monsoon weather triggers widespread evacuations across lowlands.", "World"),
    ("African Union representatives ratify a continental free trade protocol to boost intra-African commerce and infrastructure.", "World"),
    ("Diplomats announce progress on cross-continental peace accord during bilateral talks hosted in Zurich.", "World"),
    ("United Nations Food and Agriculture Organization issues urgent bulletin regarding drought-affected crop yields in East Africa.", "World"),
    ("G20 finance chiefs pledge cooperative financial assistance packages for developing nations navigating balance of payments crises.", "World"),
    ("Arctic Council convenes ministerial session to review polar conservation policies and maritime sovereignty protocols.", "World"),

    # Politics
    ("Parliament passes landmark digital privacy reform bill after heated debate over surveillance limits and civil liberties.", "Politics"),
    ("Supreme Court delivers decisive ruling on campaign finance disclosure regulations ahead of national midterms.", "Politics"),
    ("Prime Minister reshuffles executive cabinet appointments to address housing affordability and regional infrastructure bottlenecks.", "Politics"),
    ("Congressional budget committee drafts bipartisan compromise resolution to avert midnight fiscal shutdown.", "Politics"),
    ("Electoral oversight commission releases modernized cybersecurity guidelines for statewide voting infrastructure.", "Politics"),
    ("Opposition coalition demands parliamentary inquiry into defense procurement procedures and auditing discrepancies.", "Politics"),
    ("Senate subcommittee hears extensive testimony on regulatory oversight of artificial intelligence in federal hiring.", "Politics"),
    ("Governors summit debates constitutional tax powers and state-level healthcare subsidy allocations.", "Politics"),
    ("Bipartisan legislative panel unveils antitrust reform package targeting consolidated platform monopolies.", "Politics"),
    ("National election monitoring body confirms peaceful balloting procedures across seventy-five districts.", "Politics"),

    # Business
    ("Federal Reserve signals cautious stance on benchmark interest rate adjustments as consumer price indexes stabilize.", "Business"),
    ("Wall Street indexes rally to record highs led by semiconductor earnings surprises and robust consumer spending.", "Business"),
    ("Multinational logistics conglomerate announces multi-billion dollar merger to streamline global air freight networks.", "Business"),
    ("Venture capital investment into renewable energy hardware surges forty percent in the second quarter.", "Business"),
    ("Commercial real estate developers face debt refinancing hurdles amid elevated borrowing costs and remote work shifts.", "Business"),
    ("Automotive manufacturer reports surge in electric vehicle revenue while adjusting capital expenditure forecasts.", "Business"),
    ("International oil benchmarks decline following unexpected inventories build and sluggish industrial refinery demand.", "Business"),
    ("Fintech startup closes Series D funding round to scale cross-border payment rails for enterprise marketplaces.", "Business"),
    ("Retail giants announce joint sustainable supply chain initiative to eliminate non-recyclable freight packaging.", "Business"),
    ("Global sovereign wealth fund rebalances portfolios toward private credit and critical minerals infrastructure.", "Business"),

    # Technology
    ("Researchers release state-of-the-art multimodal foundation model featuring native reasoning and autonomous tool use.", "Technology"),
    ("Silicon startup tape-out novel optical compute chip achieving tenfold latency reduction for deep neural networks.", "Technology"),
    ("Open-source security foundation identifies zero-day vulnerability in popular cryptographic networking libraries.", "Technology"),
    ("Cloud providers deploy custom liquid-cooled data center racks to support next-generation machine learning clusters.", "Technology"),
    ("Autonomous vehicle developers receive regulatory approval to operate unmanned commercial robotaxi fleets across downtown.", "Technology"),
    ("Quantum computing research consortium demonstrates fault-tolerant logical qubit operations using neutral atom arrays.", "Technology"),
    ("Smart device ecosystem adopts unified local mesh networking protocol to eliminate proprietary hub dependencies.", "Technology"),
    ("Mobile operating system update introduces on-device privacy-preserving neural processing engines.", "Technology"),
    ("Cybersecurity analysts uncover automated phishing infrastructure leveraging generative voice cloning vectors.", "Technology"),
    ("Semiconductor equipment manufacturer ships high-numerical-aperture extreme ultraviolet lithography system.", "Technology"),

    # Science
    ("James Webb Space Telescope observes primordial galaxy clusters revealing unexpected cosmic structure from early universe.", "Science"),
    ("Paleontologists uncover pristine fossilized dinosaur nesting site displaying avian brooding behaviors in Patagonia.", "Science"),
    ("Physicists at laser fusion laboratory achieve net energy gain milestone using advanced indirect-drive target capsules.", "Science"),
    ("Marine biologists document thriving deep-sea hydrothermal vent ecosystem housing previously unknown microbial species.", "Science"),
    ("Geophysicists detect anomalous seismic wave anomalies indicating magma chamber replenishment beneath dormant volcano.", "Science"),
    ("Planetary exploration rover analyzes Martian sedimentary rocks containing diverse organic carbon molecules.", "Science"),
    ("Atmospheric scientists launch high-altitude stratospheric balloons to measure ozone recovery kinetics over Antarctica.", "Science"),
    ("Evolutionary geneticists sequence ancient hominin nuclear genome recovering lost genealogical branches in Eurasia.", "Science"),
    ("Materials scientists synthesize ultra-hard room-temperature boron nitride crystal with unprecedented thermal conductivity.", "Science"),
    ("Astrophysics team detects repeating fast radio burst originating from a magnetar within a nearby dwarf galaxy.", "Science"),

    # Health
    ("Clinical trial demonstrates eighty-five percent efficacy for novel mRNA therapeutic targeting resistant melanoma.", "Health"),
    ("World Health Organization declares eradication milestone for neglected tropical infectious disease across nine nations.", "Health"),
    ("Epidemiologists highlight preventative benefits of Mediterranean dietary patterns in mitigating neurodegenerative decline.", "Health"),
    ("Biopharmaceutical firm secures fast-track regulatory approval for pediatric enzyme replacement therapy.", "Health"),
    ("Cardiologists publish thirty-year longitudinal study confirming cardiovascular benefits of moderate resistance exercise.", "Health"),
    ("Public health agencies launch nationwide immunization campaign targeting respiratory syncytial virus ahead of winter.", "Health"),
    ("Genomic medicine researchers utilize base editing to successfully treat sickle cell anemia in adolescent patients.", "Health"),
    ("Neuroscientists identify sleep spindle brainwave patterns that consolidate memory and clear metabolic waste products.", "Health"),
    ("Oncology consortium standardizes liquid biopsy protocols for early pan-cancer diagnostic screenings.", "Health"),
    ("Mental health researchers report measurable efficacy of digital cognitive behavioral therapy platforms.", "Health"),

    # Sports
    ("Underdog national football club secures thrilling stoppage-time victory to claim continental championship trophy.", "Sports"),
    ("World Athletics Championship sees historic world record shattered in women's four-hundred-meter hurdles final.", "Sports"),
    ("Formula One grand prix concludes with strategic tire gamble delivering dramatic wet-weather podium finish.", "Sports"),
    ("Tennis grand slam final goes to five sets as generational phenom overcomes veteran champion on center court.", "Sports"),
    ("Olympic committee confirms final venue masterplan and sustainability certifications for upcoming Summer Games.", "Sports"),
    ("Professional basketball franchise executes blockbuster multi-player trade before midnight trade deadline.", "Sports"),
    ("Tour de France peloton conquers legendary alpine mountain pass in grueling summit showdown stage.", "Sports"),
    ("Major League Baseball championship series advances to deciding Game Seven following extra-innings walk-off home run.", "Sports"),
    ("Cricket World Cup semifinal thrills capacity stadium with record run chase in final over thriller.", "Sports"),
    ("Rugby World Cup favorites survive physical quarterfinal clash to book spot in championship showdown.", "Sports"),

    # Entertainment
    ("International film festival awards Palme d'Or to mesmerizing dystopian indie drama directed by debut filmmaker.", "Entertainment"),
    ("Global streaming giant greenlights ambitious multi-season fantasy adaptation based on bestselling novel trilogy.", "Entertainment"),
    ("Grammy-winning recording artist announces surprise stadium world tour alongside chart-topping experimental album release.", "Entertainment"),
    ("Broadway revival of classic musical sensation breaks box office records during preview week in New York.", "Entertainment"),
    ("Video game developer studio unveils gameplay footage for long-anticipated open-world action role-playing adventure.", "Entertainment"),
    ("Television academy reveals nominations honoring groundbreaking drama series and comedy ensemble casts.", "Entertainment"),
    ("Pop icon collaboration dominates global streaming leaderboards across ninety countries within hours of debut.", "Entertainment"),
    ("Cinematographer guild honors visionary neon-noir thriller for pioneering innovative virtual production techniques.", "Entertainment"),
    ("Summer blockbuster crosses one billion dollar global box office threshold propelled by IMAX ticket sales.", "Entertainment"),
    ("Documentary chronicling legendary jazz quartet unearths previously unreleased archival master recordings.", "Entertainment"),
]

def generate_augmented_articles(base_articles: List[Tuple[str, str]], target_count: int = 400) -> List[Tuple[str, str]]:
    """Generates synthetic variance for training coverage."""
    articles = list(base_articles)
    
    prefixes = [
        "Breaking News: ",
        "Special Report: ",
        "Analysis: ",
        "Update: ",
        "Market Dispatch: ",
        "Global Briefing: ",
        "According to official statements, ",
        "Industry observers note that ",
        "In a major development today, ",
        "Recent investigations confirm that "
    ]
    
    suffixes = [
        " Stakeholders continue to monitor long-term developments closely.",
        " The announcement has drawn widespread reaction across international markets.",
        " Regulatory bodies have requested comprehensive review documentation.",
        " Experts emphasize the critical implications for upcoming quarterly forecasts.",
        " Public response remains overwhelmingly attentive as deliberations proceed.",
        " Further details are scheduled to be released during tomorrow's press briefing.",
        " Observers consider this a pivotal moment for institutional strategy.",
        " The findings have sparked debate among leading industry specialists."
    ]

    while len(articles) < target_count:
        base_text, category = random.choice(base_articles)
        prefix = random.choice(prefixes) if random.random() > 0.4 else ""
        suffix = random.choice(suffixes) if random.random() > 0.4 else ""
        augmented = f"{prefix}{base_text}{suffix}".strip()
        articles.append((augmented, category))
        
    random.shuffle(articles)
    return articles

def main():
    random.seed(42)
    os.makedirs(os.path.dirname(RAW_DATA_PATH), exist_ok=True)
    os.makedirs(PROCESSED_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(REFERENCE_PATH), exist_ok=True)

    print("Generating news articles dataset...")
    full_dataset = generate_augmented_articles(SAMPLE_ARTICLES, target_count=480)

    # Write raw dataset
    with open(RAW_DATA_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["text", "label"])
        for text, label in full_dataset:
            writer.writerow([text, label])
    print(f"Saved {len(full_dataset)} raw records to {RAW_DATA_PATH}")

    # Split train (70%), val (15%), test (15%)
    n = len(full_dataset)
    train_end = int(n * 0.70)
    val_end = int(n * 0.85)

    train_data = full_dataset[:train_end]
    val_data = full_dataset[train_end:val_end]
    test_data = full_dataset[val_end:]

    for name, data in [("train.csv", train_data), ("val.csv", val_data), ("test.csv", test_data)]:
        path = os.path.join(PROCESSED_DIR, name)
        with open(path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["text", "label"])
            for text, label in data:
                writer.writerow([text, label])
        print(f"Saved {len(data)} records to {path}")

    # Reference dataset for Evidently drift monitoring (baseline distribution)
    with open(REFERENCE_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["text", "label"])
        for text, label in val_data:
            writer.writerow([text, label])
    print(f"Saved {len(val_data)} reference records to {REFERENCE_PATH}")

if __name__ == "__main__":
    main()
