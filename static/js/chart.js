// 일주일 리드-수임 전환율 차트 업데이트
function updateConversionRateChart(deals) {
    console.log('전환율 차트 업데이트 시작');
    
    // 날짜 범위 설정 - 선택기가 없으면 기본값 사용
    const dateRangeSelect = document.getElementById('conversion-date-range');
    let monthsToShow = 12; // 기본값
    
    if (!dateRangeSelect) {
        console.warn('전환율 차트 날짜 범위 선택기를 찾을 수 없습니다. 기본값 12개월을 사용합니다.');
    } else {
        monthsToShow = parseInt(dateRangeSelect.value) || 12;
    }
    
    // 월별 데이터 계산을 위한 날짜 범위 설정
    const today = new Date();
    const months = [];
    const monthLabels = [];
    
    for (let i = monthsToShow - 1; i >= 0; i--) {
        const targetDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthKey = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
        months.push(monthKey);
        monthLabels.push(monthKey); // YYYY-MM 형식 사용
    }
    
    // 월별 전체 딜 카운트 및 성공 딜 카운트
    const monthlyTotalCounts = {};
    const monthlySuccessCounts = {};
    
    // 데이터 초기화
    months.forEach(month => {
        monthlyTotalCounts[month] = 0;
        monthlySuccessCounts[month] = 0;
    });
    
    // 데이터 집계 (실제 스키마 필드명 사용)
    deals.forEach(deal => {
        // created_at 필드 사용
        let dealDate;
        
        if (deal.created_at) {
            if (typeof deal.created_at === 'string') {
                dealDate = new Date(deal.created_at);
            } else if (deal.created_at instanceof Date) {
                dealDate = deal.created_at;
            }
        }
        
        if (!dealDate) return;
        
        // 딜 날짜의 연-월 추출
        const dealMonth = `${dealDate.getFullYear()}-${String(dealDate.getMonth() + 1).padStart(2, '0')}`;
        
        // 해당 월이 표시 범위 내에 있는 경우
        if (months.includes(dealMonth)) {
            monthlyTotalCounts[dealMonth]++;
            
            // 성공 딜 카운트 ("성사됨" 상태인 경우)
            if (deal.status === "성사됨") {
                monthlySuccessCounts[dealMonth]++;
            }
        }
    });
    
    // 월별 전체 딜 수 배열
    const totalCounts = months.map(month => monthlyTotalCounts[month]);
    
    // 월별 성공 딜 수 배열
    const successCounts = months.map(month => monthlySuccessCounts[month]);
    
    // 전환율 계산
    const conversionRates = months.map(month => {
        const totalCount = monthlyTotalCounts[month];
        const successCount = monthlySuccessCounts[month];
        return totalCount > 0 ? (successCount / totalCount) * 100 : 0;
    });
    
    // 데이터가 부족한 경우 샘플 데이터 사용
    let usingSampleData = false;
    
    if (Object.values(monthlyTotalCounts).reduce((sum, count) => sum + count, 0) === 0) {
        usingSampleData = true;
        
        // 샘플 데이터 생성
        for (let i = 0; i < months.length; i++) {
            // 월별 총 딜 건수 (20~50건 랜덤)
            totalCounts[i] = Math.floor(Math.random() * 31) + 20;
            
            // 성공 딜 건수 (총 건수의 20%~60% 랜덤)
            const successRate = Math.random() * 0.4 + 0.2;
            successCounts[i] = Math.floor(totalCounts[i] * successRate);
            
            // 전환율 계산
            conversionRates[i] = (successCounts[i] / totalCounts[i]) * 100;
        }
    }
    
    // 차트 캔버스 요소 가져오기
    const chartCanvas = document.getElementById('conversionRateChart');
    if (!chartCanvas) {
        console.error('전환율 차트 캔버스 요소를 찾을 수 없습니다: conversionRateChart');
        return; // 캔버스 요소가 없으면 중단
    }
    
    // 기존 차트가 있으면 제거
    if (window.conversionRateChart) {
        window.conversionRateChart.destroy();
        console.log('기존 차트 인스턴스 제거');
    }
    
    console.log('차트 데이터:', {
        months: monthLabels,
        totalCounts,
        successCounts,
        conversionRates
    });
    
    // 차트 옵션
    const chartConfig = {
        type: 'line',
        data: {
            labels: monthLabels,
            datasets: [
                {
                    label: '총 리드 수',
                    data: totalCounts,
                    backgroundColor: 'rgba(74, 144, 226, 0.1)',
                    borderColor: '#4a90e2',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1,
                    yAxisID: 'y'
                },
                {
                    label: '성사된 딜 수',
                    data: successCounts,
                    backgroundColor: 'rgba(80, 200, 120, 0.1)',
                    borderColor: '#50c878',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1,
                    yAxisID: 'y'
                },
                {
                    label: '전환율 (%)',
                    data: conversionRates,
                    backgroundColor: 'rgba(243, 156, 18, 0.1)',
                    borderColor: '#f39c12',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.1,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false
                },
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 15,
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            family: 'Spoqa Han Sans Neo',
                            size: 12
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '월'
                    },
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: 'Spoqa Han Sans Neo',
                            size: 11
                        }
                    }
                },
                y: {
                    position: 'left',
                    title: {
                        display: true,
                        text: '건수'
                    },
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        font: {
                            family: 'Spoqa Han Sans Neo',
                            size: 11
                        }
                    }
                },
                y1: {
                    position: 'right',
                    title: {
                        display: true,
                        text: '전환율 (%)'
                    },
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        display: false
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        },
                        font: {
                            family: 'Spoqa Han Sans Neo',
                            size: 11
                        }
                    }
                }
            }
        }
    };
    
    // 차트 생성
    window.conversionRateChart = new Chart(chartCanvas, chartConfig);
    
    // 샘플 데이터 메시지
    if (usingSampleData) {
        const chartContainer = document.querySelector('.chart-canvas-container');
        if (chartContainer) {
            const existingMessage = chartContainer.querySelector('.sample-data-message');
            
            if (existingMessage) {
                existingMessage.remove();
            }
            
            const messageDiv = document.createElement('div');
            messageDiv.className = 'sample-data-message';
            messageDiv.style.position = 'absolute';
            messageDiv.style.bottom = '10px';
            messageDiv.style.right = '10px';
            messageDiv.style.fontSize = '11px';
            messageDiv.style.color = '#888';
            messageDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            messageDiv.style.padding = '2px 5px';
            messageDiv.style.borderRadius = '4px';
            messageDiv.textContent = '* 샘플 데이터가 표시됩니다';
            
            chartContainer.appendChild(messageDiv);
        }
    }
    
    console.log('전환율 차트 업데이트 완료');
}

// 월별/담당자별 딜 테이블 업데이트 (이전: 일별)
function updateDailyOwnerTable(deals) {
    // 담당자 목록 추출 및 필터 옵션 채우기 (실제 스키마에 맞게 변경)
    const ownerField = 'manager'; 
    const allOwners = Array.from(new Set(deals.map(deal => deal[ownerField]))).filter(Boolean).sort();
    
    // 담당자 필터 옵션 채우기
    updateOwnerFilterOptions(allOwners);
    
    // 현재 필터 값 가져오기
    const dateFilter = document.getElementById('dateRangeFilter');
    const ownerFilter = document.getElementById('ownerFilter');
    const statusFilter = document.getElementById('statusFilter');
    
    // 월 표시 범위 (기본값: 12개월)
    const monthsToShow = parseInt(dateFilter?.value) || 12;
    const selectedOwner = ownerFilter?.value || 'all';
    const selectedStatus = statusFilter?.value || 'all';
    
    // 기준 날짜 (현재 달)
    const today = new Date();
    
    // 월 범위 생성 (최근 N개월)
    const months = [];
    const monthLabels = [];
    
    for (let i = monthsToShow - 1; i >= 0; i--) {
        const targetDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthKey = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
        months.push(monthKey);
        
        // 월 표시 형식: YYYY-MM
        monthLabels.push(`${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`);
    }
    
    // 필터링된 데이터 생성
    let filteredDeals = deals.slice(); // 원본 데이터 복사
    
    // 상태 필터 적용 (변경된 필드명 사용)
    if (selectedStatus !== 'all') {
        const statusMapping = {
            'success': '성사됨',
            'progress': '진행중',
            'fail': '실패'
        };
        filteredDeals = filteredDeals.filter(deal => deal.status === statusMapping[selectedStatus]); 
    }
    
    // 담당자 필터 적용
    if (selectedOwner !== 'all') {
        filteredDeals = filteredDeals.filter(deal => deal[ownerField] === selectedOwner);
    }
    
    // 필터가 적용된 담당자 목록 (선택된 담당자만 표시하거나 전체 표시)
    const displayOwners = selectedOwner !== 'all' ? [selectedOwner] : allOwners;
    
    // 월별 담당자별 딜 수 계산
    const monthlyOwnerData = {};
    const successOwnerData = {}; // 성공 딜 데이터
    
    // 데이터 구조 초기화
    months.forEach(month => {
        monthlyOwnerData[month] = {};
        successOwnerData[month] = {}; // 성공 딜 데이터 초기화
        displayOwners.forEach(owner => {
            monthlyOwnerData[month][owner] = 0;
            successOwnerData[month][owner] = 0; // 성공 딜 데이터 초기화
        });
    });
    
    // 실제 데이터 집계 - 필드명 수정
    filteredDeals.forEach(deal => {
        const owner = deal[ownerField];
        if (!owner || !displayOwners.includes(owner)) return;
        
        // created_at 필드 사용
        let dealDate;
        
        if (deal.created_at) {
            if (typeof deal.created_at === 'string') {
                dealDate = new Date(deal.created_at);
            } else if (deal.created_at instanceof Date) {
                dealDate = deal.created_at;
            }
        }
        
        if (!dealDate) return;
        
        // 딜 날짜의 연-월 추출
        const dealMonth = `${dealDate.getFullYear()}-${String(dealDate.getMonth() + 1).padStart(2, '0')}`;
        
        // 해당 월이 표시 범위 내에 있으면 카운트
        if (months.includes(dealMonth)) {
            if (!monthlyOwnerData[dealMonth][owner]) {
                monthlyOwnerData[dealMonth][owner] = 0;
                successOwnerData[dealMonth][owner] = 0;
            }
            monthlyOwnerData[dealMonth][owner]++;
            
            // 성공 딜 카운트 ("성사됨" 상태인 경우) 
            if (deal.status === "성사됨") {
                successOwnerData[dealMonth][owner]++;
            }
        }
    });
    
    // 데이터가 부족한 경우 샘플 데이터 사용
    let usingSampleData = false;
    
    if (Object.keys(monthlyOwnerData).length === 0 || displayOwners.length === 0) {
        usingSampleData = true;
        // 샘플 담당자 목록 - 필터에 맞게 조정
        let sampleOwners;
        
        if (selectedOwner !== 'all') {
            sampleOwners = [selectedOwner];
        } else if (window.actualManagers && window.actualManagers.length) {
            // 실제 데이터베이스에서 가져온 담당자 목록 사용
            sampleOwners = window.actualManagers;
        } else {
            // 기본 담당자 목록 사용
            sampleOwners = ['김대표', '이사원', '박부장', '최과장'];
        }
        
        // 샘플 데이터 생성
        months.forEach(month => {
            monthlyOwnerData[month] = {};
            successOwnerData[month] = {};
            sampleOwners.forEach(owner => {
                // 10-30 범위의 랜덤 숫자 생성 (월별이므로 더 많은 딜 수 설정)
                const totalDeals = Math.floor(Math.random() * 21) + 10;
                // 성공 딜은 전체 딜의 30~80% 랜덤하게 설정
                const successRate = Math.random() * 0.5 + 0.3; // 30% ~ 80%
                const successDeals = Math.floor(totalDeals * successRate);
                
                monthlyOwnerData[month][owner] = totalDeals;
                successOwnerData[month][owner] = successDeals;
            });
        });
        
        // 실제 테이블 업데이트를 위해 샘플 담당자 목록 사용
        displayOwners.length = 0;
        displayOwners.push(...sampleOwners);
    }
    
    console.log('월별 담당자 데이터 처리 완료. 테이블 업데이트 시작');
    
    // 차트 섹션 복원 - 테이블 컨테이너 요소를 먼저 체크
    const chartSection = document.querySelector('.chart-section:first-of-type');
    if (chartSection && chartSection.innerHTML.includes('loading-message')) {
        // 로딩 메시지가 있다면 원래 내용으로 복원
        chartSection.innerHTML = `
            <h2>월별 담당자별 딜 현황</h2>
            <div style="overflow-x: auto;">
                <table id="dailyOwnerStatsTable" class="data-table">
                    <thead>
                        <tr>
                            <th>담당자 / 월</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        `;
    }

    // 테이블 업데이트
    const table = document.getElementById('dailyOwnerStatsTable');
    
    // 테이블이 없으면 에러 메시지 출력하고 함수 종료
    if (!table) {
        console.error('테이블 요소를 찾을 수 없습니다. 테이블 ID: dailyOwnerStatsTable');
        console.log('현재 문서 내 테이블 요소들:', document.querySelectorAll('table').length);
        
        // 데이터 통계만 로그에 출력
        console.log('월별 담당자 데이터:', displayOwners.map(owner => ({
            담당자: owner,
            월별건수: months.map(month => ({
                월: month,
                전체건수: monthlyOwnerData[month][owner],
                성사건수: successOwnerData[month][owner]
            })),
            합계: months.reduce((sum, month) => sum + (monthlyOwnerData[month][owner] || 0), 0)
        })));
        return;
    }
    
    const thead = table.querySelector('thead tr');
    const tbody = table.querySelector('tbody');
    
    if (!thead || !tbody) {
        console.error('테이블 헤더나 본문 요소를 찾을 수 없습니다.');
        return;
    }
    
    // 헤더 초기화
    thead.innerHTML = '<th rowspan="2">담당자</th>';
    
    // 월 헤더 추가 (가로로 나열)
    months.forEach(month => {
        const th = document.createElement('th');
        const [year, monthNum] = month.split('-');
        // 연도-월 형식으로 표시
        th.textContent = `${year}-${monthNum}`;
        th.style.fontSize = '0.75rem'; // 헤더 폰트 크기 축소
        thead.appendChild(th);
    });
    
    // 합계 헤더 추가
    const totalHeader = document.createElement('th');
    totalHeader.textContent = '합계';
    thead.appendChild(totalHeader);
    
    // 본문 초기화
    tbody.innerHTML = '';
    
    // 담당자별 행 추가 (세로로 나열)
    displayOwners.forEach(owner => {
        // 첫 번째 행 - 전체 딜 수
        const totalRow = document.createElement('tr');
        totalRow.classList.add('owner-total-row');
        
        // 담당자명 셀 (2행을 합침)
        const ownerCell = document.createElement('td');
        ownerCell.textContent = owner;
        ownerCell.rowSpan = 2; // 2개의 행을 합침
        ownerCell.style.fontSize = '0.8rem'; // 담당자명 폰트 크기 축소
        totalRow.appendChild(ownerCell);
        
        // 각 월별 전체 딜 수
        let ownerTotalDeals = 0;
        months.forEach(month => {
            const totalCount = monthlyOwnerData[month][owner] || 0;
            ownerTotalDeals += totalCount;
            
            const cell = document.createElement('td');
            cell.textContent = totalCount;
            cell.style.fontSize = '0.8rem'; // 숫자 폰트 크기 축소
            totalRow.appendChild(cell);
        });
        
        // 담당자별 전체 딜 합계
        const totalCell = document.createElement('td');
        totalCell.textContent = ownerTotalDeals;
        totalCell.style.fontWeight = 'bold';
        totalCell.style.fontSize = '0.8rem'; // 합계 폰트 크기 축소
        totalRow.appendChild(totalCell);
        
        tbody.appendChild(totalRow);
        
        // 두 번째 행 - 성공 비율 (퍼센트)
        const percentRow = document.createElement('tr');
        percentRow.classList.add('owner-percent-row');
        
        // 각 월별 성공 비율
        months.forEach(month => {
            const totalCount = monthlyOwnerData[month][owner] || 0;
            const successCount = successOwnerData[month][owner] || 0;
            const successPercent = totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0;
            
            const cell = document.createElement('td');
            // 더 간결한 표시 방식 (성공/전체 형식 대신 비율만 표시)
            cell.textContent = `${successPercent}%`;
            cell.style.fontSize = '0.75rem'; // 더 작은 폰트 크기
            cell.style.color = '#666';
            
            // 툴팁에 상세 정보 추가
            cell.title = `${successCount}/${totalCount} (${successPercent}%)`;
            
            // 성공 비율이 20% 이상인 경우 강조 표시
            if (successPercent >= 20) {
                cell.classList.add('success-rate-high');
            }
            
            percentRow.appendChild(cell);
        });
        
        // 담당자별 전체 성공 비율
        const totalSuccessCount = months.reduce((sum, month) => sum + (successOwnerData[month][owner] || 0), 0);
        const totalSuccessPercent = ownerTotalDeals > 0 ? Math.round((totalSuccessCount / ownerTotalDeals) * 100) : 0;
        
        const totalPercentCell = document.createElement('td');
        // 전체 비율도 간결하게 표시
        totalPercentCell.textContent = `${totalSuccessPercent}%`;
        totalPercentCell.style.fontSize = '0.75rem';
        totalPercentCell.style.color = '#666';
        totalPercentCell.style.fontWeight = 'bold';
        
        // 툴팁에 상세 정보 추가
        totalPercentCell.title = `${totalSuccessCount}/${ownerTotalDeals} (${totalSuccessPercent}%)`;
        
        // 전체 성공 비율이 20% 이상인 경우 강조 표시
        if (totalSuccessPercent >= 20) {
            totalPercentCell.classList.add('success-rate-high');
        }
        
        percentRow.appendChild(totalPercentCell);
        
        tbody.appendChild(percentRow);
    });
    
    // 합계 행 추가
    const totalRow = document.createElement('tr');
    totalRow.classList.add('grand-total-row');
    
    // 합계 라벨
    const totalLabelCell = document.createElement('td');
    totalLabelCell.textContent = '합계';
    totalLabelCell.style.fontWeight = 'bold';
    totalLabelCell.style.fontSize = '0.8rem'; // 폰트 크기 축소
    totalRow.appendChild(totalLabelCell);
    
    // 각 월별 합계
    let grandTotal = 0;
    let grandSuccessTotal = 0;
    months.forEach(month => {
        let monthTotal = 0;
        let monthSuccessTotal = 0;
        displayOwners.forEach(owner => {
            monthTotal += monthlyOwnerData[month][owner] || 0;
            monthSuccessTotal += successOwnerData[month][owner] || 0;
        });
        grandTotal += monthTotal;
        grandSuccessTotal += monthSuccessTotal;
        
        const cell = document.createElement('td');
        cell.textContent = monthTotal;
        cell.style.fontWeight = 'bold';
        cell.style.fontSize = '0.8rem'; // 폰트 크기 축소
        totalRow.appendChild(cell);
    });
    
    // 전체 합계
    const grandTotalCell = document.createElement('td');
    grandTotalCell.textContent = grandTotal;
    grandTotalCell.style.fontWeight = 'bold';
    grandTotalCell.style.fontSize = '0.8rem'; // 폰트 크기 축소
    totalRow.appendChild(grandTotalCell);
    
    tbody.appendChild(totalRow);
    
    // 전체 성공 비율 행
    const totalPercentRow = document.createElement('tr');
    totalPercentRow.classList.add('grand-percent-row');
    
    // 성공 비율 라벨
    const percentLabelCell = document.createElement('td');
    percentLabelCell.textContent = '성공률';
    percentLabelCell.style.fontWeight = 'bold';
    percentLabelCell.style.color = '#666';
    percentLabelCell.style.fontSize = '0.8rem'; // 폰트 크기 축소
    totalPercentRow.appendChild(percentLabelCell);
    
    // 각 월별 성공 비율
    months.forEach(month => {
        let monthTotal = 0;
        let monthSuccessTotal = 0;
        displayOwners.forEach(owner => {
            monthTotal += monthlyOwnerData[month][owner] || 0;
            monthSuccessTotal += successOwnerData[month][owner] || 0;
        });
        const monthSuccessPercent = monthTotal > 0 ? Math.round((monthSuccessTotal / monthTotal) * 100) : 0;
        
        const cell = document.createElement('td');
        // 간결한 표시 방식으로 변경
        cell.textContent = `${monthSuccessPercent}%`;
        cell.style.fontSize = '0.75rem';
        cell.style.fontWeight = 'bold';
        cell.style.color = '#666';
        
        // 툴팁에 상세 정보 추가
        cell.title = `${monthSuccessTotal}/${monthTotal} (${monthSuccessPercent}%)`;
        
        // 성공 비율이 20% 이상인 경우 강조 표시
        if (monthSuccessPercent >= 20) {
            cell.classList.add('success-rate-high');
        }
        
        totalPercentRow.appendChild(cell);
    });
    
    // 전체 성공 비율
    const grandSuccessPercent = grandTotal > 0 ? Math.round((grandSuccessTotal / grandTotal) * 100) : 0;
    
    const grandPercentCell = document.createElement('td');
    // 간결한 표시 방식으로 변경
    grandPercentCell.textContent = `${grandSuccessPercent}%`;
    grandPercentCell.style.fontSize = '0.75rem';
    grandPercentCell.style.fontWeight = 'bold';
    grandPercentCell.style.color = '#666';
    
    // 툴팁에 상세 정보 추가
    grandPercentCell.title = `${grandSuccessTotal}/${grandTotal} (${grandSuccessPercent}%)`;
    
    // 전체 성공 비율이 20% 이상인 경우 강조 표시
    if (grandSuccessPercent >= 20) {
        grandPercentCell.classList.add('success-rate-high');
    }
    
    totalPercentRow.appendChild(grandPercentCell);
    
    tbody.appendChild(totalPercentRow);
    
    // 맞춤형 스타일을 추가하여 테이블 가독성 향상
    const allRows = tbody.querySelectorAll('tr');
    allRows.forEach((row, index) => {
        // 짝수/홀수 행에 따라 배경색 다르게 적용
        if (index % 4 === 0 || index % 4 === 1) {
            row.style.backgroundColor = '#f9f9fc';
        }
    });
    
    // 샘플 데이터 사용 메시지 표시
    if (usingSampleData) {
        const tableContainer = table.parentNode;
        const existingMessage = tableContainer.querySelector('.sample-data-message');
        
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'sample-data-message';
        messageDiv.style.textAlign = 'center';
        messageDiv.style.marginTop = '10px';
        messageDiv.style.color = '#888';
        messageDiv.innerHTML = '* 샘플 데이터를 표시 중입니다. 실제 데이터가 로드되지 않았습니다.';
        tableContainer.appendChild(messageDiv);
    }
    
    console.log('테이블 업데이트 완료');
}

// 담당자 필터 옵션 업데이트 함수
function updateOwnerFilterOptions(owners) {
    const ownerFilter = document.getElementById('ownerFilter');
    if (!ownerFilter) return;
    
    // 기존 선택 값 저장
    const currentValue = ownerFilter.value;
    
    // 기존 옵션 제거 (첫 번째 '전체' 옵션 유지)
    while (ownerFilter.options.length > 1) {
        ownerFilter.remove(1);
    }
    
    // 새 옵션 추가
    owners.forEach(owner => {
        const option = document.createElement('option');
        option.value = owner;
        option.textContent = owner;
        ownerFilter.appendChild(option);
    });
    
    // 가능하면 이전 선택 값 복원
    if (currentValue !== 'all' && [...ownerFilter.options].some(opt => opt.value === currentValue)) {
        ownerFilter.value = currentValue;
    }
}

// 월 범위 필터 업데이트 함수
function updateMonthRangeOptions() {
    const dateRangeFilter = document.getElementById('dateRangeFilter');
    const conversionDateRange = document.getElementById('conversion-date-range');
    
    // 월 범위 옵션 설정 (3개월, 6개월, 12개월, 24개월)
    const monthRangeOptions = [
        { value: 3, text: '최근 3개월' },
        { value: 6, text: '최근 6개월' },
        { value: 12, text: '최근 12개월', selected: true },
        { value: 24, text: '최근 24개월' }
    ];
    
    // 테이블 필터 업데이트
    if (dateRangeFilter) {
        // 기존 옵션 제거
        dateRangeFilter.innerHTML = '';
        
        // 새 옵션 추가
        monthRangeOptions.forEach(option => {
            const optElement = document.createElement('option');
            optElement.value = option.value;
            optElement.textContent = option.text;
            if (option.selected) optElement.selected = true;
            dateRangeFilter.appendChild(optElement);
        });
    }
    
    // 차트 필터 업데이트
    if (conversionDateRange) {
        // 기존 옵션 제거
        conversionDateRange.innerHTML = '';
        
        // 새 옵션 추가
        monthRangeOptions.forEach(option => {
            const optElement = document.createElement('option');
            optElement.value = option.value;
            optElement.textContent = option.text;
            if (option.selected) optElement.selected = true;
            conversionDateRange.appendChild(optElement);
        });
    }
}

// 필터 이벤트 리스너 설정
function setupFilterEventListeners() {
    const dateRangeFilter = document.getElementById('dateRangeFilter');
    const ownerFilter = document.getElementById('ownerFilter');
    const statusFilter = document.getElementById('statusFilter');
    const conversionDateRange = document.getElementById('conversion-date-range');
    
    if (dateRangeFilter) {
        dateRangeFilter.addEventListener('change', function() {
            if (window.originalData && window.originalData.deals) {
                updateDailyOwnerTable(window.originalData.deals);
            }
        });
    }
    
    if (ownerFilter) {
        ownerFilter.addEventListener('change', function() {
            if (window.originalData && window.originalData.deals) {
                updateDailyOwnerTable(window.originalData.deals);
            }
        });
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            if (window.originalData && window.originalData.deals) {
                updateDailyOwnerTable(window.originalData.deals);
            }
        });
    }
    
    if (conversionDateRange) {
        conversionDateRange.addEventListener('change', function() {
            if (window.originalData && window.originalData.deals) {
                updateConversionRateChart(window.originalData.deals);
            }
        });
    }
}

// DOMContentLoaded 이벤트에서 필터 이벤트 리스너 설정 추가
document.addEventListener('DOMContentLoaded', function() {
    // 월 범위 필터 옵션 초기화
    updateMonthRangeOptions();
    // 필터 이벤트 리스너 설정
    setupFilterEventListeners();
});

// 차트 모듈 - 데이터 시각화 관련 기능

// 전역 변수
let charts = {}; // 차트 객체 저장

// 차트 초기화
function initCharts() {
    console.log('차트 모듈 초기화');
    
    // 차트 캔버스 요소 확인 (전환율 차트)
    const conversionRateCanvas = document.getElementById('conversionRateChart');
    
    if (!conversionRateCanvas) {
        console.warn('차트 캔버스가 존재하지 않습니다.');
        return; // 캔버스가 없으면 초기화 중단
    }
    
    // 차트를 생성하기 전에 기존 차트 제거 (메모리 누수 방지)
    if (window.conversionRateChart instanceof Chart) {
        window.conversionRateChart.destroy();
    }
    
    // 기본 차트 생성 
    window.conversionRateChart = new Chart(conversionRateCanvas, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: '총 리드 수',
                    data: [],
                    borderColor: '#4a90e2',
                    backgroundColor: 'rgba(74, 144, 226, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1
                },
                {
                    label: '성사된 딜 수',
                    data: [],
                    borderColor: '#50c878',
                    backgroundColor: 'rgba(80, 200, 120, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1
                },
                {
                    label: '전환율 (%)',
                    data: [],
                    borderColor: '#f39c12',
                    backgroundColor: 'rgba(243, 156, 18, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.1,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '월'
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '건수'
                    },
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                y1: {
                    position: 'right',
                    title: {
                        display: true,
                        text: '전환율 (%)'
                    },
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false
                },
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 15,
                        usePointStyle: true,
                        padding: 20
                    }
                }
            }
        }
    });
    
    // 차트 모듈 초기화 완료
    console.log('차트 초기화 완료');
    
    // 필터 이벤트 리스너 등록
    setupFilterEventListeners();
}

// 차트 업데이트
function updateCharts(deals) {
    console.log('차트 업데이트 시작');
    
    if (!deals || !charts) {
        console.warn('업데이트할 거래 데이터나 차트가 존재하지 않습니다.');
        return;
    }
    
    // 거래 상태 차트 업데이트
    updateStatusChart(deals);
    
    // 시간별 거래 차트 업데이트
    updateTimelineChart(deals);
    
    // 소스별 거래 차트 업데이트
    updateSourceChart(deals);
    
    console.log('차트 업데이트 완료');
}

// 거래 상태 차트 업데이트
function updateStatusChart(deals) {
    if (!charts.statusChart) return;
    
    // 거래 상태별 카운트
    const statusCounts = {
        active: 0,
        won: 0,
        lost: 0
    };
    
    // 상태별 집계
    deals.forEach(deal => {
        if (deal.status === 'active' || deal.status === 'pending') {
            statusCounts.active++;
        } else if (deal.status === 'won') {
            statusCounts.won++;
        } else if (deal.status === 'lost') {
            statusCounts.lost++;
        }
    });
    
    // 차트 데이터 업데이트
    charts.statusChart.data.datasets[0].data = [
        statusCounts.active,
        statusCounts.won,
        statusCounts.lost
    ];
    
    // 차트 업데이트
    charts.statusChart.update();
}

// 시간별 거래 차트 업데이트
function updateTimelineChart(deals) {
    if (!charts.timelineChart) return;
    
    // 거래를 날짜별로 그룹화
    const dateGroups = groupDealsByDate(deals);
    
    // 날짜 정렬 (최근 12개)
    const sortedDates = Object.keys(dateGroups).sort().slice(-12);
    
    // 차트 데이터 업데이트
    charts.timelineChart.data.labels = sortedDates.map(date => formatDateForChart(date));
    charts.timelineChart.data.datasets[0].data = sortedDates.map(date => dateGroups[date].length);
    
    // 차트 업데이트
    charts.timelineChart.update();
}

// 소스별 거래 차트 업데이트
function updateSourceChart(deals) {
    if (!charts.sourceChart) return;
    
    // 거래를 소스별로 그룹화
    const sourceGroups = {};
    
    deals.forEach(deal => {
        const source = deal.source || '기타';
        if (!sourceGroups[source]) {
            sourceGroups[source] = [];
        }
        sourceGroups[source].push(deal);
    });
    
    // 소스별 카운트 내림차순 정렬
    const sortedSources = Object.keys(sourceGroups).sort((a, b) => {
        return sourceGroups[b].length - sourceGroups[a].length;
    }).slice(0, 8); // 상위 8개만 표시
    
    // 차트 데이터 업데이트
    charts.sourceChart.data.labels = sortedSources;
    charts.sourceChart.data.datasets[0].data = sortedSources.map(source => sourceGroups[source].length);
    
    // 차트 업데이트
    charts.sourceChart.update();
}

// 거래를 날짜별로 그룹화
function groupDealsByDate(deals) {
    const dateGroups = {};
    
    deals.forEach(deal => {
        // 날짜 추출 (연월일)
        const dealDate = new Date(deal.created_at);
        const dateKey = `${dealDate.getFullYear()}-${String(dealDate.getMonth() + 1).padStart(2, '0')}-${String(dealDate.getDate()).padStart(2, '0')}`;
        
        if (!dateGroups[dateKey]) {
            dateGroups[dateKey] = [];
        }
        
        dateGroups[dateKey].push(deal);
    });
    
    return dateGroups;
}

// 차트 표시용 날짜 형식 변환
function formatDateForChart(dateString) {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}`;
}

// 차트 모듈 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('차트 모듈이 로드되었습니다.');
    initCharts();
}); 