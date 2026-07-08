from decimal import Decimal, ROUND_HALF_UP
from unicodedata import normalize


def normalize_text(value: str) -> str:
    normalized = normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    return " ".join(normalized.lower().strip().split())


def decimal_or_zero(value: Decimal | int | float | None) -> Decimal:
    if value is None:
        return Decimal("0")
    return Decimal(str(value))


def round_decimal(value: Decimal, places: str = "0.01") -> Decimal:
    return value.quantize(Decimal(places), rounding=ROUND_HALF_UP)


def calculate_bmi(weight_kg: Decimal, height_cm: Decimal) -> Decimal:
    if weight_kg <= 0:
        raise ValueError("Weight must be greater than zero")
    if height_cm <= 0:
        raise ValueError("Height must be greater than zero")
    height_m = height_cm / Decimal("100")
    return round_decimal(weight_kg / (height_m * height_m))


def scale_per_100g(amount_per_100g: Decimal, grams: Decimal) -> Decimal:
    if grams < 0:
        raise ValueError("Grams cannot be negative")
    return round_decimal(amount_per_100g * grams / Decimal("100"))
