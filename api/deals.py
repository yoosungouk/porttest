from flask import jsonify
from supabase import create_client

def handle_request(request):
    # Supabase 설정
    supabase_url = "https://slguorfgltrdbyfzkbka.supabase.co"
    supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsZ3VvcmZnbHRyZGJ5ZnprYmthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0Nzc5NzgsImV4cCI6MjA2MDA1Mzk3OH0.27a9HrNmT89ZoRExQUSpMkUNRmnawN1poJnYV0rXTHE"
    client = create_client(supabase_url, supabase_key)
    
    try:
        # 거래 데이터 조회
        response = client.from_('deals').select('*').execute()
        deals = response.data
        
        # 샘플 데이터 생성 (데이터가 없는 경우)
        if not deals:
            deals = [
                {
                    "id": 1,
                    "deal_owner": "김영호",
                    "deal_status": "진행중",
                    "deal_created_at": "2024-04-01",
                    "category": "SaaS"
                },
                {
                    "id": 2,
                    "deal_owner": "박지연",
                    "deal_status": "성공",
                    "deal_created_at": "2024-04-02",
                    "category": "Cloud"
                },
                {
                    "id": 3,
                    "deal_owner": "김영호",
                    "deal_status": "성공",
                    "deal_created_at": "2024-04-03",
                    "category": "AI"
                },
                {
                    "id": 4,
                    "deal_owner": "이민지",
                    "deal_status": "진행중",
                    "deal_created_at": "2024-04-04",
                    "category": "Finance"
                },
                {
                    "id": 5,
                    "deal_owner": "박지연",
                    "deal_status": "실패",
                    "deal_created_at": "2024-04-05",
                    "category": "Analytics"
                },
                {
                    "id": 6,
                    "deal_owner": "김영호",
                    "deal_status": "성공",
                    "deal_created_at": "2024-04-06",
                    "category": "IoT"
                },
                {
                    "id": 7,
                    "deal_owner": "이민지",
                    "deal_status": "진행중",
                    "deal_created_at": "2024-04-07",
                    "category": "SaaS"
                }
            ]
        
        # 변환된 데이터 구조로 반환
        formatted_deals = []
        for deal in deals:
            formatted_deal = {
                "id": deal.get("id", 0),
                "staff": deal.get("deal_owner", ""),
                "status": deal.get("deal_status", ""),
                "created_at": deal.get("deal_created_at", ""),
                "category": deal.get("category", "기타")  # 카테고리 필드가 없으면 '기타'로 설정
            }
            formatted_deals.append(formatted_deal)
        
        return jsonify({"deals": formatted_deals})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500 