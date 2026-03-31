"""
Generate a realistic synthetic DGMS (Directorate General of Mines Safety) dataset.
Based on actual Indian mining accident patterns from 2016-2022.
Run this once to produce dgms_incidents.csv
"""
import csv
import random
import json
from datetime import date, timedelta

random.seed(42)

STATES = {
    "Jharkhand": 0.28,
    "Odisha": 0.18,
    "Chhattisgarh": 0.16,
    "West Bengal": 0.10,
    "Madhya Pradesh": 0.08,
    "Telangana": 0.06,
    "Andhra Pradesh": 0.05,
    "Rajasthan": 0.04,
    "Karnataka": 0.03,
    "Maharashtra": 0.02,
}

MINE_TYPES = {
    "Coal": 0.62,
    "Iron Ore": 0.14,
    "Limestone": 0.08,
    "Bauxite": 0.05,
    "Copper": 0.04,
    "Manganese": 0.04,
    "Mica": 0.03,
}

ACCIDENT_TYPES = [
    "Roof Fall",
    "Gas/Fumes Explosion",
    "Inundation/Flooding",
    "Machinery Failure",
    "Transportation Accident",
    "Fire",
    "Blasting Accident",
    "Electrical Accident",
    "Slope Failure",
    "Winding Accident",
]

CAUSES = {
    "Roof Fall": [
        "Inadequate roof support",
        "Unsupported span exceeded limit",
        "Delayed roof support installation",
        "Geologically disturbed ground",
        "Improper blasting pattern",
        "Failure to identify roof condition",
    ],
    "Gas/Fumes Explosion": [
        "Methane accumulation due to poor ventilation",
        "Ignition from electrical spark",
        "Inadequate gas monitoring",
        "Blasting near gas pockets",
        "Ventilation system failure",
        "Spontaneous coal combustion",
    ],
    "Inundation/Flooding": [
        "Old workings not properly mapped",
        "Barrier pillar robbed",
        "Surface water ingress",
        "Failure to conduct hydrostatic tests",
        "Breaching of old waterlogged workings",
        "Inadequate pumping capacity",
    ],
    "Machinery Failure": [
        "Poor maintenance of equipment",
        "Operator error",
        "Hydraulic system failure",
        "Brake failure",
        "Overloading of equipment",
        "Electrical fault in machinery",
        "Worn-out components not replaced",
    ],
    "Transportation Accident": [
        "Brake failure on inclined road",
        "Overloading of dump trucks",
        "Driver fatigue",
        "Poor road condition",
        "Speeding in haul road",
        "Failure of coupling in haulage",
        "Signal system malfunction",
    ],
    "Fire": [
        "Spontaneous combustion of coal",
        "Electrical short circuit",
        "Careless handling of flammable material",
        "Accumulation of coal dust",
        "Inadequate fire suppression systems",
    ],
    "Blasting Accident": [
        "Misfire handling without proper procedure",
        "Excess explosive charging",
        "Premature detonation",
        "Fly rock due to improper stemming",
        "Failure to evacuate danger zone",
    ],
    "Electrical Accident": [
        "Uninsulated cables",
        "Faulty earthing",
        "Working near live cables",
        "Overloaded circuits",
        "Water ingress into electrical panels",
    ],
    "Slope Failure": [
        "Over-steepened bench slopes",
        "Heavy rainfall destabilizing spoil",
        "Improper dump management",
        "Vibration from nearby blasting",
        "Inadequate slope monitoring",
    ],
    "Winding Accident": [
        "Overwinding of cage/skip",
        "Brake failure in winding engine",
        "Signal miscommunication",
        "Faulty decking equipment",
        "Mechanical failure of headgear",
    ],
}

MINE_NAMES = {
    "Jharkhand": ["Dhanbad Central Colliery", "Jharia Coal Mine", "Bokaro Colliery", "Chasnalla Colliery",
                  "Bastacolla Colliery", "Sudamdih Colliery", "Katras Colliery", "Moonidih Mine",
                  "Barora Colliery", "Sendra Bansjora Colliery", "East Bokaro Colliery"],
    "Odisha": ["Talcher Coalfield", "Ib Valley Mine", "Mahanadi Coalfields", "Darlipali Mine",
               "Hemgir Mine", "Garjanbahal Mine", "Bhusan Steel Mine", "Keonjhar Iron Ore Mine",
               "Daitari Iron Ore Mine", "Sukinda Chromite Mine"],
    "Chhattisgarh": ["Korba Mine", "Gevra OCP", "Dipka Mine", "Kusmunda Mine", "Hasdev Bango Area",
                     "Chirimiri Colliery", "Hasdeo Arand Mine", "South Eastern Coalfields"],
    "West Bengal": ["Raniganj Coalfield", "Sonepur Bazari Mine", "Salanpur Colliery", "Bankola Area",
                    "Kunustoria Colliery", "Satgram Colliery"],
    "Madhya Pradesh": ["Singrauli Mine", "Sohagpur Coalfield", "Johilla Coalfield", "Pench Area",
                       "Pathakhera Colliery"],
    "Telangana": ["Singareni Collieries", "Ramagundam Mine", "Mandamarri Mine", "Yellandu Colliery",
                  "Godavarikhani Mine"],
    "Andhra Pradesh": ["Vempalle Limestone Mine", "Yerraguntla Mine", "Mangampeta Baryte Mine"],
    "Rajasthan": ["Zawar Zinc-Lead Mine", "Rajpura-Dariba Mine", "Sindesar Khurd Mine", "Kayad Mine"],
    "Karnataka": ["Kudremukh Iron Ore Mine", "Sandur Manganese Mine", "Obulapuram Iron Ore Mine"],
    "Maharashtra": ["Wardha Valley Coalfield", "Ballarpur Colliery", "Ghugus Mine"],
}

EQUIPMENT = {
    "Machinery Failure": ["Excavator", "Dragline", "Continuous Miner", "Longwall Shearer", "Drill Rig",
                          "Loader", "Dozer", "Crusher", "Conveyor", "Coal Cutter"],
    "Transportation Accident": ["Dump Truck", "HEMM", "Mantrip", "Rope Haulage", "Belt Conveyor",
                                 "Loco", "Side Dumper", "Tanker"],
    "Fire": ["Electrical Panel", "Conveyor Belt", "Coal Seam", "Transformer", "Diesel Equipment"],
    "Roof Fall": ["N/A", "Roof Bolter", "Support Frame", "Arch Support"],
    "Gas/Fumes Explosion": ["Ventilation Fan", "Gas Detector", "N/A"],
    "Electrical Accident": ["HT Cable", "Switch Gear", "Transformer", "Motor", "Drill Machine"],
}

CORRECTIVE_ACTIONS = [
    "Enhanced roof support protocol implemented",
    "Mandatory gas monitoring at all shift starts",
    "Updated equipment maintenance schedule",
    "Driver safety retraining program initiated",
    "Barrier pillar survey conducted",
    "Ventilation audit completed, additional fans installed",
    "Electrical safety inspection of all panels",
    "Emergency response drill conducted",
    "Slope stability analysis commissioned",
    "CCTV monitoring installed in high-risk zones",
    "Incident reporting system upgraded",
    "Safety officer headcount doubled for night shifts",
    "Mining method revised to cut-and-fill stoping",
    "All equipment fitted with proximity detection system",
    "Hydrogeological survey ordered before resuming work",
]

def weighted_choice(choices: dict):
    keys = list(choices.keys())
    weights = list(choices.values())
    return random.choices(keys, weights=weights, k=1)[0]

HIGH_RISK_TYPES = {"Gas/Fumes Explosion", "Inundation/Flooding", "Winding Accident"}
MED_RISK_TYPES = {"Roof Fall", "Fire", "Blasting Accident", "Slope Failure"}
LOW_RISK_TYPES = {"Electrical Accident", "Machinery Failure", "Transportation Accident"}

def get_severity(acc_type, casualties, injured, workers_on_site, is_underground):
    # Base score from accident type
    if acc_type in HIGH_RISK_TYPES:
        base = 3
    elif acc_type in MED_RISK_TYPES:
        base = 2
    else:
        base = 1

    # Modify by casualties and injuries
    if casualties >= 3:
        base = max(base, 3)
    elif casualties >= 1:
        base = max(base, 2)

    if injured >= 3:
        base = max(base, 2)
    elif injured >= 1:
        base = max(base, 1)

    # Underground increases risk
    if is_underground and base >= 2:
        base = min(base + 1, 3)

    # Large workforce means higher potential impact
    if workers_on_site > 200 and base >= 2:
        base = min(base + 1, 3)

    return ["Low", "Medium", "High", "Critical"][base]

def generate_description(acc_type, cause, mine_name, state, mine_type):
    templates = {
        "Roof Fall": f"A sudden roof collapse occurred at {mine_name}, {state}. {cause}. Workers in the affected heading were trapped.",
        "Gas/Fumes Explosion": f"A gas explosion was reported at {mine_name}, {state}. {cause}. Underground workers were evacuated immediately.",
        "Inundation/Flooding": f"Water inundation incident at {mine_name}, {state}. {cause}. Emergency pumping operations commenced.",
        "Machinery Failure": f"A machinery failure incident occurred at {mine_name}, {state}. {cause}. Operations were halted pending inspection.",
        "Transportation Accident": f"A transportation accident took place at {mine_name}, {state}. {cause}. The vehicle was a total loss.",
        "Fire": f"A fire broke out at {mine_name}, {state}. {cause}. Fire brigade was called and sealing operations initiated.",
        "Blasting Accident": f"A blasting accident occurred at {mine_name}, {state}. {cause}. The area was cordoned off for investigation.",
        "Electrical Accident": f"An electrical accident was reported at {mine_name}, {state}. {cause}. Power supply to the affected section was isolated.",
        "Slope Failure": f"A slope failure occurred at {mine_name}, {state}. {cause}. Dump management practices are under review.",
        "Winding Accident": f"A winding accident took place at {mine_name}, {state}. {cause}. The shaft was suspended from operations.",
    }
    return templates.get(acc_type, f"An incident of type {acc_type} occurred at {mine_name}.")

def generate_dataset(n=550):
    records = []
    start = date(2016, 1, 1)
    end = date(2022, 12, 31)
    delta = (end - start).days

    for i in range(n):
        state = weighted_choice(STATES)
        mine_type = weighted_choice(MINE_TYPES)
        acc_type = random.choice(ACCIDENT_TYPES)
        cause = random.choice(CAUSES.get(acc_type, ["Unknown cause"]))
        mine_name = random.choice(MINE_NAMES.get(state, ["Unknown Mine"]))
        equipment = random.choice(EQUIPMENT.get(acc_type, ["N/A"]))

        # Casualty distribution skewed towards 0-2
        casualties = random.choices([0, 1, 2, 3, 4, 5, 6, 8, 10],
                                     weights=[35, 25, 15, 10, 7, 4, 2, 1, 1], k=1)[0]
        injured = random.choices([0, 1, 2, 3, 4, 5, 6],
                                   weights=[40, 20, 15, 12, 7, 4, 2], k=1)[0]

        workers_on_site = random.randint(20, 500)
        is_underground = mine_type in ["Coal"] and random.random() > 0.3
        severity = get_severity(acc_type, casualties, injured, workers_on_site, is_underground)
        incident_date = start + timedelta(days=random.randint(0, delta))
        corrective = random.choice(CORRECTIVE_ACTIONS)
        description = generate_description(acc_type, cause, mine_name, state, mine_type)

        records.append({
            "incident_id": f"DGMS-{incident_date.year:04d}-{i+1:04d}",
            "date": incident_date.isoformat(),
            "year": incident_date.year,
            "month": incident_date.month,
            "state": state,
            "mine_name": mine_name,
            "mine_type": mine_type,
            "accident_type": acc_type,
            "cause": cause,
            "description": description,
            "casualties": casualties,
            "injured": injured,
            "severity": severity,
            "equipment_involved": equipment,
            "corrective_action": corrective,
            "is_underground": is_underground,
            "shift": random.choice(["Morning", "Afternoon", "Night"]),
            "workers_on_site": workers_on_site,
        })

    # Sort by date
    records.sort(key=lambda x: x["date"])
    return records

if __name__ == "__main__":
    import os
    data = generate_dataset(550)

    # Save CSV
    out_csv = os.path.join(os.path.dirname(__file__), "dgms_incidents.csv")
    with open(out_csv, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)

    # Save JSON
    out_json = os.path.join(os.path.dirname(__file__), "dgms_incidents.json")
    with open(out_json, "w") as f:
        json.dump(data, f, indent=2)

    print(f"Generated {len(data)} records → {out_csv}")
    print(f"Casualties total: {sum(r['casualties'] for r in data)}")
    print(f"High/Critical: {sum(1 for r in data if r['severity'] in ['High','Critical'])}")
