

/**
 * 월별 지출 내역 로드
 */
function getReportMonthsExpense(userNo, date) {
    // 만약 파라미터로 넘어온 userNo가 비어있다면, 로컬 스토리지에서 꺼내 쓰는 안전장치
    const finalUserNo = userNo || sessionStorage.getItem("userNo") || "";

    $.ajax({
        method: "GET",
        url: "paymentmonths",
        data: { 
            "date": date,
            "userNo": finalUserNo // userNo=:1 방지용
        },
        success: function(data) {
            currentData = transformData(data); 
            renderAll(currentData);
        },
        error: function(xhr) {
            if (xhr.status !== 401) { // 401은 위 ajaxSetup에서 이미 처리함
                alert("데이터 로드 실패: " + xhr.status);
            }
        }
    });
}

/**
 * 결제 날짜(분기/월) 목록 로드
 */
function getPaymentDates(userNo) {
    const finalUserNo = userNo || sessionStorage.getItem("userNo") || "";

    $.ajax({
        method: "GET",
        url: "paymentDates",
        data: { "userNo": finalUserNo },
        success: function(dates) {
            MONTHS = dates;
            initSelect();
            // 첫 화면 로드 시 가장 최근 날짜의 데이터를 가져옴
            getReportMonthsExpense(finalUserNo, getSelected());
        },
        error: function(xhr) {
            if (xhr.status !== 401) {
                alert("데이터 로드 실패: " + xhr.status);
            }
        }
    });
}

/**
 * 고정지출 등록 페이지 전용 날짜 로드
 */
function getPaymentDatesForFixed(userNo) {
    const finalUserNo = userNo || sessionStorage.getItem("userNo") || "";

    $.ajax({
        method: "GET",
        url: "paymentDates",
        data: { "userNo": finalUserNo },
        success: function(dates) {
            // fixed.js에 있는 셀렉트 박스 초기화 함수 호출
            initApplyMonthSelect(dates);
        },
        error: function(xhr) {
            if (xhr.status !== 401) {
                alert("날짜 목록 로드 실패: " + xhr.status);
            }
        }
    });
}

/**
 * 고정지출 데이터 서버 전송 (UPDATE 실행)
 */
function updateFixedCost(payload) {
    $.ajax({
        method: "POST",
        url: "addfixedcost",
        data: { 
            "cost": payload.amount,
            "category": payload.category, // 예: INSU_AMDEC
            "date": payload.month         // 예: 2023q3
        },
        success: function(result) {
            // 서블릿에서 out.print(isSuccess)로 보낸 boolean 값 처리
            if (result === true || result === "true") {
                showToast('✅ 고정지출이 등록되었습니다.');
                // 1.5초 후 메인 페이지(소비 패턴)로 이동하여 결과 확인
                setTimeout(() => {
                    location.href = "index.html"; 
                }, 1500);
            } else {
                alert("등록 실패: 해당 분기에 데이터가 존재하지 않습니다.");
            }
        },
        error: function(xhr) {
            if (xhr.status !== 401) {
                alert("서버 통신 중 에러가 발생하였습니다: " + xhr.status);
            }
        }
    });
}