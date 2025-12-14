
// https://api.codetabs.com/v1/proxy/?quest=https://quote.eastmoney.com/stockhotmap/api/getquotedata
// https://seep.eu.org/https://quote.eastmoney.com/stockhotmap/api/getquotedata

colors = [
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
function getColorByChange(change) {
    return change >= 4 ? colors[40] :          
           change <= -4 ? colors[0] :          
           colors[Math.floor((change - -4) * 5)];  
}

function calculateFontSize(width, height) {
    console.log(width, height)
  // 1. 检查最小尺寸 - 太小就不显示文字
  if (width < 32 || height < 20) return 0;
  
  // 2. 直接用 if-else 链实现原始逻辑
  if (width >= 180 && height >= 120) return 28;
  if (width >= 160 && height >= 100) return 26;
  if (width >= 140 && height >= 90) return 24;
  if (width >= 120 && height >= 80) return 20;
  if (width >= 100 && height >= 70) return 18;
  if (width >= 80 && height >= 60) return 16;
  if (width >= 60 && height >= 50) return 14;
  if (width >= 50 && height >= 40) return 12;
  if (width >= 45 && height >= 30) return 11;
  if (width >= 40 && height >= 25) return 10;
  if (width >= 35 && height >= 22) return 9;
  if (width >= 32 && height >= 20) return 8;
  
  return 0; // 默认不显示
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
        let stockData;
        if (stockMap.has(parts[0])) {
            stockData = stockMap.get(parts[0]);
        } else {
            const bkName = bk[parseInt(parts[0])].split('|')[0]
            stockData = {
                name: bkName,
                value: 0,
                order: parseInt(parts[0]),
                children: []
            }
            stockMap.set(parts[0], stockData)
        }
        const value = Math.abs(parseFloat(parts[16]) || 0)
        const change =  (parseFloat(parts[6] || '0')  / 100).toFixed(2)
        stockData.children.push({
            name: parts[1] + '\n' + change + '%',
            value: value,
            itemStyle: {
                color: getColorByChange(change)
            }
        });
        stockData.value += value
    })
    const treeData = Array.from(stockMap.values())
        .sort((a, b) => a.order - b.order)
        .map(sector => {
            sector.children.sort((a, b) => b.value - a.value);
            return sector;
        });
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
            labelLayout:function(params){
                return {
                    fontSize: calculateFontSize(params.rect.width, params.rect.height)
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




