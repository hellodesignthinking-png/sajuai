"""
진태양시 보정 (True Solar Time Correction) 모듈

표준시(KST = UTC+9)와 실제 태양의 위치(경도 기반) 간의 오차를 계산하여
사주 시각을 보정합니다.

공식:
  EOT (균시차) = 경도 보정 + 균시차(Equation of Time)
  진태양시 = 표준시 + (경도 보정분) + EOT
"""

import math
from datetime import datetime, timedelta
from typing import Tuple

# 주요 도시 경도 데이터 (한국 + 자주 사용되는 해외 도시)
CITY_LONGITUDES: dict[str, float] = {
    # 한국
    "서울": 126.978, "seoul": 126.978,
    "부산": 129.075, "busan": 129.075,
    "대구": 128.601, "daegu": 128.601,
    "인천": 126.706, "incheon": 126.706,
    "광주": 126.852, "gwangju": 126.852,
    "대전": 127.385, "daejeon": 127.385,
    "울산": 129.317, "ulsan": 129.317,
    "수원": 127.009, "suwon": 127.009,
    "제주": 126.531, "jeju": 126.531,
    "경주": 129.211, "gyeongju": 129.211,
    "전주": 127.148, "jeonju": 127.148,
    "청주": 127.489, "cheongju": 127.489,
    "창원": 128.681, "changwon": 128.681,
    "춘천": 127.730, "chuncheon": 127.730,
    # 일본
    "도쿄": 139.691, "tokyo": 139.691,
    "오사카": 135.502, "osaka": 135.502,
    # 중국
    "베이징": 116.407, "beijing": 116.407,
    "상하이": 121.473, "shanghai": 121.473,
    # 미국
    "뉴욕": -74.006, "new york": -74.006, "newyork": -74.006,
    "로스앤젤레스": -118.243, "los angeles": -118.243, "la": -118.243,
    # 유럽
    "런던": -0.128, "london": -0.128,
    "파리": 2.349, "paris": 2.349,
    # 기본값 (서울)
    "default": 126.978,
}

# 한국 표준시 기준 경도 (135°E)
KST_STANDARD_LONGITUDE = 135.0


def get_longitude(city_name: str) -> float:
    """도시명(한글/영문)으로 경도를 반환합니다. 없으면 서울 기본값."""
    if not city_name:
        return CITY_LONGITUDES["default"]
    
    key = city_name.strip().lower()
    # 부분 매칭 시도
    for city_key, lon in CITY_LONGITUDES.items():
        if city_key in key or key in city_key:
            return lon
    
    return CITY_LONGITUDES["default"]


def equation_of_time(day_of_year: int) -> float:
    """
    균시차(Equation of Time)를 분 단위로 계산합니다.
    Spencer(1971) 근사식 사용.
    
    Args:
        day_of_year: 1~365 (윤년 포함 시 366)
    Returns:
        균시차 (분, minutes)
    """
    B = (360 / 365) * (day_of_year - 81)
    B_rad = math.radians(B)
    eot = (9.87 * math.sin(2 * B_rad)
           - 7.53 * math.cos(B_rad)
           - 1.5 * math.sin(B_rad))
    return eot  # 분 단위


def calculate_true_solar_time(
    birth_datetime: datetime,
    city_name: str
) -> Tuple[datetime, dict]:
    """
    진태양시를 계산합니다.
    
    Args:
        birth_datetime: 출생 일시 (KST 기준)
        city_name: 출생지 도시명
    
    Returns:
        (진태양시 datetime, 보정 상세 정보 dict)
    """
    longitude = get_longitude(city_name)
    
    # 1. 경도 보정 (분 단위)
    # KST 기준경도(135°)와의 차이에 따른 시간 오차
    # 경도 1° = 4분 (360° / 24h = 15°/h → 1° = 4min)
    longitude_diff_minutes = (longitude - KST_STANDARD_LONGITUDE) * 4.0
    
    # 2. 균시차 보정
    day_of_year = birth_datetime.timetuple().tm_yday
    eot_minutes = equation_of_time(day_of_year)
    
    # 3. 총 보정값 (분 단위)
    total_correction_minutes = longitude_diff_minutes + eot_minutes
    
    # 4. 진태양시 계산
    true_solar_time = birth_datetime + timedelta(minutes=total_correction_minutes)
    
    return true_solar_time, {
        "original_kst": birth_datetime.strftime("%Y-%m-%d %H:%M"),
        "true_solar_time": true_solar_time.strftime("%Y-%m-%d %H:%M"),
        "city": city_name,
        "longitude": longitude,
        "longitude_correction_min": float(round(longitude_diff_minutes, 2)),
        "equation_of_time_min": float(round(eot_minutes, 2)),
        "total_correction_min": float(round(total_correction_minutes, 2)),
        "hour_corrected": true_solar_time.hour,
        "minute_corrected": true_solar_time.minute,
    }


def get_corrected_hour(birth_date: str, birth_time: str, city_name: str) -> dict:
    """
    프론트엔드에서 받은 날짜/시간 문자열을 파싱하여 진태양시 보정 결과를 반환합니다.
    
    Args:
        birth_date: "YYYY-MM-DD" 형식
        birth_time: "HH:MM" 형식 (없으면 빈 문자열)
        city_name: 출생지 도시명
    
    Returns:
        보정 상세 정보 dict (hour_corrected 포함)
    """
    if not birth_time or birth_time.strip() == "":
        return {
            "original_kst": birth_date,
            "true_solar_time": birth_date,
            "city": city_name or "서울",
            "longitude": get_longitude(city_name or "서울"),
            "longitude_correction_min": 0,
            "equation_of_time_min": 0,
            "total_correction_min": 0,
            "hour_corrected": None,
            "minute_corrected": None,
            "note": "시간 정보 없음 — 보정 생략"
        }
    
    try:
        dt_str = f"{birth_date} {birth_time}"
        birth_dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M")
        _, correction_info = calculate_true_solar_time(birth_dt, city_name or "서울")
        return correction_info
    except Exception as e:
        return {
            "error": str(e),
            "hour_corrected": None,
            "note": "진태양시 보정 실패 — 표준시 사용"
        }
