const ctx = document.getElementById('myChart');
const myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: data.company.monthsRun,
        datasets: [{
            label: 'Bank Balance',
            //data: [12, 19, 3, 5, 2, 3],
            data: data.company.monthlyBalance,
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

const ctz = document.getElementById('myChart2');
const myChart2 = new Chart(ctz, {
    type: 'line',
    data: {
      labels: data.company.monthsRun,
      datasets: [{ 
          data: data.company.gb,
          label: "German Biscuits",
          borderColor: "rgba(54, 162, 235, 1)",
          fill: false
        }, { 
          data: data.company.vbs,
          label: "Vegan Brownie",
          borderColor: "rgba(255, 206, 86, 1)",
          fill: false
        }, { 
          data: data.company.rc,
          label: "Rasp Creams",
          borderColor: "rgba(75, 192, 192, 1)",
          fill: false
        }, { 
          data: data.company.rcg,
          label: "Rasp & White Choc Gateaux",
          borderColor: "rgba(153, 102, 255, 1)",
          fill: false
        }, { 
          data: data.company.rvg,
          label: "Red Velvet",
          borderColor: "rgba(255, 159, 64, 1)",
          fill: false
        }, { 
          data: data.company.pb,
          label: "Pavlova",
          borderColor: "rgba(255, 159, 64, 1)",
          fill: false
        }, { 
          data: data.company.rwcs,
          label: "Scones",
          borderColor: "rgba(255,215,0)",
          fill: false
        }, { 
          data: data.company.sb,
          label: "Soda Bread",
          borderColor: "rgba(220,20,60)",
          fill: false
        }, { 
          data: data.company.pd,
          label: "Donuts",
          borderColor: "rgba(143,188,143)",
          fill: false
        }, { 
          data: data.company.rrc,
          label: "Rasp Cheesecake",
          borderColor: "rgba(138,43,226)",
          fill: false
        }, { 
          data: data.company.bc,
          label: "Biscoff cake",
          borderColor: "rgba(255,192,203)",
          fill: false
        }, { 
          data: data.company.mac,
          label: "Aero cake",
          borderColor: "rgba((127,255,212))",
          fill: false
        }, { 
          data: data.company.fvb,
          label: "FV Biscuits",
          borderColor: "rgba(154,205,50)",
          fill: false
        }, { 
          data: data.company.jdb,
          label: "JD Biscuits",
          borderColor: "rgba(139,0,0)",
          fill: false
        }
      ]
    },
    options: {
      title: {
        display: true,
        text: 'Yearly Outgoings'
      }
    }
  });

const cty = document.getElementById('myChart3');
const myChart3 = new Chart(cty, {
    type: 'bar',
    data: {
        //labels: ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'],
        labels: data.company.monthsRun,
        datasets: [{
            label: 'Profit',
            //data: [12, 19, 3, 5, 2, 3],
            data: data.company.monthlyProfit,
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
  
            ],
            borderWidth: 1
            
        }, {
        label: 'Loss',
            //data: [12, 19, 3, 5, 2, 3],
            data: data.company.monthlyLoss,
            backgroundColor: [
                'rgba(54, 162, 235, 0.2)',
            ],
            borderColor: [

                'rgba(54, 162, 235, 1)',
 
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

const ctw = document.getElementById('myChart4');
const myChart4 = new Chart(ctw, {
    type: 'bar',
    data: {
        //labels: ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'],
        labels: data.company.monthsRun,
        datasets: [{
            label: 'Customer Visits each month',
            //data: [12, 19, 3, 5, 2, 3],
            data: data.company.visits,
            backgroundColor: [
                'rgba(153, 102, 255, 0.2)',
            ],
            borderColor: [
                'rgba(153, 102, 255, 1)',
  
            ],
            borderWidth: 1
            
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

