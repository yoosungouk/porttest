from flask import jsonify
from supabase import create_client

def handle_request(request):
    # Supabase 설정
    supabase_url = "https://zthihjyrifsbsbsaaky.supabase.co"
    supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0aGloanlyaWZzYnNzYnNhYWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0Nzc5NzgsImV4cCI6MjA2MDA1Mzk3OH0.27a9HrNmT89ZoRExQUSpMkUNRmnawN1poJnYV0rXTHE"
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
                    "name": "Enterprise SaaS Deal",
                    "created_at": "2024-04-01",
                    "staff": "김영호",
                    "status": "progress",
                    "category": "SaaS"
                },
                {
                    "id": 2,
                    "name": "SMB Cloud Migration",
                    "created_at": "2024-04-02",
                    "staff": "박지연",
                    "status": "success",
                    "category": "Cloud"
                },
                {
                    "id": 3,
                    "name": "Healthcare AI Solution",
                    "created_at": "2024-04-03",
                    "staff": "김영호",
                    "status": "success",
                    "category": "AI"
                },
                {
                    "id": 4,
                    "name": "Financial Services Platform",
                    "created_at": "2024-04-04",
                    "staff": "이민지",
                    "status": "progress",
                    "category": "Finance"
                },
                {
                    "id": 5,
                    "name": "Retail Analytics Package",
                    "created_at": "2024-04-05",
                    "staff": "박지연",
                    "status": "failed",
                    "category": "Analytics"
                },
                {
                    "id": 6,
                    "name": "Manufacturing IoT Implementation",
                    "created_at": "2024-04-06",
                    "staff": "김영호",
                    "status": "success",
                    "category": "IoT"
                },
                {
                    "id": 7,
                    "name": "Education Platform Upgrade",
                    "created_at": "2024-04-07",
                    "staff": "이민지",
                    "status": "progress",
                    "category": "SaaS"
                }
            ]
        
        return jsonify({"deals": deals})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500 