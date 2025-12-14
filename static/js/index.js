
// https://api.codetabs.com/v1/proxy/?quest=https://quote.eastmoney.com/stockhotmap/api/getquotedata
// https://seep.eu.org/https://quote.eastmoney.com/stockhotmap/api/getquotedata

const colors = [
    "#30cc5a", "#30c558", "#30be56", "#2fb854", "#2fb152",
    "#2faa51", "#2fa450", "#2f9e4f", "#30974f", "#31904e",
    "#31894e", "#32844e", "#347d4e", "#35764e", "#366f4e",
    "#38694f", "#3a614f", "#3b5a50", "#3d5451", "#3f4c53",
    "#414554", "#4f4554", "#5a4554", "#644553", "#6f4552",
    "#784551", "#824450", "#8b444e", "#94444d", "#9d434b",
    "#a5424a", "#ae4248", "#b64146", "#bf4045", "#c73e43",
    "#ce3d41", "#d73c3f", "#df3a3d", "#e6393b", "#ee373a",
    "#f63538"
];
function getColorByChange(change, limit = 4) {
    return change >= limit ? colors[colors.length - 1] :          
           change <= -limit ? colors[0] :          
           colors[Math.round((change - (-limit)) / (limit - (-limit)) * (colors.length - 1))];  
}

const sizeRules = [
    { minWidth: 180, minHeight: 120, fontSize: 28 },
    { minWidth: 160, minHeight: 100, fontSize: 26 },
    { minWidth: 140, minHeight: 90, fontSize: 24 },
    { minWidth: 120, minHeight: 80, fontSize: 20 },
    { minWidth: 100, minHeight: 70, fontSize: 18 },
    { minWidth: 80, minHeight: 60, fontSize: 16 },
    { minWidth: 60, minHeight: 50, fontSize: 14 },
    { minWidth: 50, minHeight: 40, fontSize: 12 },
    { minWidth: 45, minHeight: 30, fontSize: 11 },
    { minWidth: 40, minHeight: 25, fontSize: 10 },
    { minWidth: 35, minHeight: 22, fontSize: 9 },
    { minWidth: 32, minHeight: 20, fontSize: 8 }
];

function calculateFontSize(width, height, scaleFactor = 1) {
    const size = sizeRules.find(rule => 
        width >= rule.minWidth && height >= rule.minHeight
    )?.fontSize || 0;
    return size * scaleFactor;
}
const myChart = echarts.init(document.getElementById('chartd'));
$.get('static/data/getquotedata.json', function(data) {
    quotetime = data.quotetime
    bk = data.bk    
    const stockMap = new Map();
    (data.data || [])
    .filter(item => item?.includes('|')) 
    .map(item => item.split('|'))
    .forEach(parts => {
        const [bk_index, stock_name] = parts;
        const boxt_value = parseFloat(parts[16]) || 0
        const color_value = parseFloat(parts[6]) || 0

        const value = Math.abs(boxt_value)
        const change =  (color_value / 100).toFixed(2)
        if (!stockMap.has(bk_index)) {
            stockMap.set(bk_index, {
                name: bk[parseInt(bk_index)].split('|')[0],
                value: 0,
                order: parseInt(bk_index),
                children: []
            });
        }
        let stockData = stockMap.get(bk_index);
        stockData.children.push({
            name: `${stock_name}\n${change}%`,
            value: value,
            itemStyle: {
                color: getColorByChange(change)
            }
        });
        stockData.value += value
    })
    const treeData = Array.from(stockMap.values())
        .sort((a, b) => a.order - b.order)
        .map(sector => ({
            ...sector,
            children: sector.children.sort((a, b) => b.value - a.value)
        }));
    console.log(treeData)
    myChart.setOption({
        series: [{ 
            type: 'treemap',
            left:'left',
            top:'top',
            right:' right',
            bottom:' bottom',
            animation: false,
            animationDuration: 0,
            silent: true,
            itemStyle: {
              borderColor: '#262931',
            },
            levels:[
                {
                    itemStyle: {
                        normal: {
                            gapWidth: 2
                        }
                    },
                },
                {
                    itemStyle: {
                        normal: {
                            gapWidth: 1
                        }
                    },
                    upperLabel: {
                        show: true,
                        color:'#fff'
                    },
                },               
            ],
            label:{
                fontFamily:'sans-serif',
                overflow: 'none'
            },
            labelLayout:function(params){
                let width = params.rect.width
                const names = params.text.split('\n')
                if (names[0].length > 4) {
                    width -= 12
                }
                return {
                    align: 'center', 
                    fontSize: calculateFontSize(width, params.rect.height),
                };
            }, 
            breadcrumb: {
                show: false
            },
            roam: false,
            nodeClick: false,
            data:  treeData,
            sort: 'descending',
            leafDepth: 2,   
            layoutAlgorithm: 'squarify',
            squareRatio: 1,
        }]
    });

});
window.addEventListener('resize', function() {
    myChart.resize();
});




