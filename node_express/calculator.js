
function make_calculation_text(params){
    let pf1 = parseFloat(params.n1);
    let pf3 = parseFloat(params.n3);
    let pf2 = null;

    switch(params.n2){
        case '+':
        case '-':
        case '×':
        case '÷':
            pf2 = params.n2;
    }

    if(pf1 == NaN || pf3 == NaN || !pf2){
        return "そのけいさんはできないよ";
    }


    let ans = 0;
    switch(pf2){
        case '+':
            ans = pf1 + pf3;
            return `${pf1}、たす、${pf3}、のこたえは、${ans}、だよ`;
        case '-':
            ans = pf1 - pf3;
            return `${pf1}、ひく、${pf3}、のこたえは、${ans}、だよ`;
        case '×':
            ans = pf1 * pf3;
            return `${pf1}、かける、${pf3}、のこたえは、${ans}、だよ`;
        case '÷':
            ans = pf1 / pf3;
            return `${pf1}、わる、${pf3}、のこたえは、${ans}、だよ`;
    }

    return 'エラー';

}

exports.make_calculation_text = make_calculation_text;