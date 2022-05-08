//main function for calculations and financial in/outgoings
function simulate_calc(data) {

    //totals variables
    var totalSalePerProduct = 0.00;
    var totalPackCost = 0;
    var totalProductsMade = 0;
    var totalProductsSold = 0;
    var productSaleProfit = 0.00;
    var monthlyStaffPay = 0;
    var yearlyStaffPay = 0;

    for (let a in data.company.Products) {

        //totalling product sale information
        let p = data.company.Products[a];
        totalSalePerProduct += p.totalSale;
        totalPackCost += p.totalPackagingCost;
        totalProductsMade += p.volumeMadePerYear;
        totalProductsSold += p.volumeSoldPerYear;
    }

    //calculate the profit from products
    productSaleProfit += (totalSalePerProduct - totalPackCost);
    //include sales from Vendor
    productSaleProfit += data.company.AdminManagement.Management.Vendor.totalReceivedFromVendor;

    //output total no. products made per year
    console.log("Total number of products made this year: " + totalProductsMade);
    document.getElementById('totalMade').innerHTML = "<h2><b><em>" + totalProductsMade.toLocaleString('en-UK') + "</em></b></h2>";
    //output total no. products sold per year
    console.log("Total number of products sold this year: " + totalProductsSold);
    document.getElementById('totalSold').innerHTML = "<h2><b><em>" + totalProductsSold.toLocaleString('en-UK') + "</em></b></h2>";

    //output total tips this year - not added to calculations as accepted by Staff in cash
    console.log("Total tips made by staff this year: " + data.company.Finances.Banking.Ingoing.totalTips);

    var fin = data.company.Finances;

    //current bank balance before bills:
    console.log("Bank Balance (before bills): " + fin.bankBalance.toFixed(2));

    //calculating monthly/yearly data for graphs and cards in index.html and script.js 

    var options = { month: 'long' };
    var currentMonth = data.date;
    var currentYear = data.date;
    currentMonth = (new Intl.DateTimeFormat('en-UK', options).format(currentMonth));
    currentYear = ' ' + currentYear.getFullYear();
    shortDate = currentMonth + currentYear;

    var monthProf = data.company.Finances.Turnover.annualProfit;
    var monthLoss = data.company.Finances.Turnover.annualLoss;
    var cvisits = data.company.customersVisit;

    if (!arrayCheck(shortDate, data.company.monthsRun)) {

        //pushing data to arrays each month
        data.company.monthsRun.push(shortDate);
        data.company.monthlyProfit.push(monthProf);
        data.company.monthlyLoss.push(monthLoss);
        data.company.customersVisit = 0;
        var currentBal = fin.bankBalance.toFixed();
        data.company.monthlyBalance.push(currentBal);

        //adding to product sale arrays for products graph
        for (let i in data.company.Products) {

            let p = data.company.Products[i];
            var sale = p.volumeSoldPerYear;
            //console.log(p.key);
            if (p.key == 0) {
                data.company.gb.push(sale);
            } else if (p.key == 1) {
                data.company.vbs.push(sale);
            } else if (p.key == 2) {
                data.company.rc.push(sale);
            } else if (p.key == 3) {
                data.company.rcg.push(sale);
            } else if (p.key == 4) {
                data.company.rvg.push(sale);
            } else if (p.key == 5) {
                data.company.pb.push(sale);
            } else if (p.key == 6) {
                data.company.rwcs.push(sale);
            } else if (p.key == 7) {
                data.company.sb.push(sale);
            } else if (p.key == 8) {
                data.company.pd.push(sale);
            } else if (p.key == 9) {
                data.company.rrc.push(sale);
            } else if (p.key == 10) {
                data.company.bc.push(sale);
            } else if (p.key == 11) {
                data.company.mac.push(sale);
            } else if (p.key == 12) {
                data.company.fvb.push(sale);
            } else if (p.key == 13) {
                data.company.jdb.push(sale);
            }

        }

    }
    //pushing customer visits per month
    if (isLastDayOfMonth(data.date)) {
        data.company.visits.push(cvisits);
    }

    //outgoing finances

    //paying employees per month - first day of the month
    var dateDay = data.date;
    dateDay = dateDay.getDate();

    if (dateDay == data.company.Finances.Banking.Outgoing.staffPayRollDate) {

        console.log("Employees paid today.");

        for (let em in data.company.Employees) {
            let emp = data.company.Employees[em];

            if (emp.status == "Active") {

                var empSalary = 0;
                empSalary = emp.salary / 12;
                monthlyStaffPay += empSalary;

                //add to finances, take away from bank balance
                data.company.Finances.Banking.Outgoing.staffPayRollMonthly += empSalary;

                console.log("STATE LOG: OUTGOING - Bill paid - Staff payroll: " + emp.employeeName + " Pay: £" + empSalary);

                var fin = data.company.Finances;
                fin.bankBalance -= empSalary;
                fin.Turnover.annualLoss += empSalary;

                //work out yearly staff pay
                yearlyStaffPay = monthlyStaffPay * 12;
                yearlyStaffPay = yearlyStaffPay.toFixed(2);

                //reset deductions and OT monthly to zero
                emp.deductions = 0;
                emp.overtime = 0;
                emp.overtimePay = 0;
                console.log("Employees reset deductions, ot and ot pay: " + emp.deductions + emp.overtime + emp.overtimePay);
            }

        }
        console.log("Outgoing monthly payment to staff: " + monthlyStaffPay);
        console.log("Overall yearly Staff outgoings so far: " + yearlyStaffPay);
    }

    //Yearly bills

    //licencing bills

    var lc = data.company.AdminManagement.LicencingCosts;

    //legal fees
    if (isToday(lc.Legal.billPaymentDue)) {
        lc.Legal.billPaid = true;
        payBill(lc.Legal.annualCosts);
        console.log("STATE LOG: OUTGOING - Legal Fees Bill paid. New bank balance: " + fin.bankBalance.toFixed(2));
    }
    if (lc.Legal.billPaid) {
        addYearBillDate(lc.Legal.billPaymentDue);
        lc.Legal.billPaid = false;
    }

    //accounting fees
    if (isToday(lc.Accounting.billPaymentDue)) {
        lc.Accounting.billPaid = true;
        payBill(lc.Accounting.annualCosts);
        console.log("STATE LOG: OUTGOING - Accounting Fees Bill paid. New bank balance: " + fin.bankBalance.toFixed(2));
    }
    if (lc.Accounting.billPaid) {
        addYearBillDate(lc.Accounting.billPaymentDue);
        lc.Accounting.billPaid = false;
    }

    //security fees
    if (isToday(lc.SecurityCCTV.billPaymentDue)) {
        lc.SecurityCCTV.billPaid = true;
        payBill(lc.SecurityCCTV.annualCosts);
        console.log("STATE LOG: OUTGOING - Security Fees Bill paid. New bank balance: " + fin.bankBalance.toFixed(2));
    }
    if (lc.SecurityCCTV.billPaid) {
        addYearBillDate(lc.SecurityCCTV.billPaymentDue);
        lc.SecurityCCTV.billPaid = false;
    }

    //street display fees
    if (isToday(lc.StreetDisplayLicence.billPaymentDue)) {
        lc.StreetDisplayLicence.billPaid = true;
        payBill(lc.StreetDisplayLicence.annualCosts);
        console.log("STATE LOG: OUTGOING - Street Display Bill paid. New bank balance: " + fin.bankBalance.toFixed(2));
    }
    if (lc.StreetDisplayLicence.billPaid) {
        addYearBillDate(lc.StreetDisplayLicence.billPaymentDue);
        lc.StreetDisplayLicence.billPaid = false;
    }

    //music licence
    if (isToday(lc.MusicLicence.billPaymentDue)) {
        lc.MusicLicence.billPaid = true;
        payBill(lc.MusicLicence.annualCosts);
        console.log("STATE LOG: OUTGOING - Music Licence Bill paid. New bank balance: " + fin.bankBalance.toFixed(2));
    }
    if (lc.MusicLicence.billPaid) {
        addYearBillDate(lc.MusicLicence.billPaymentDue);
        lc.MusicLicence.billPaid = false;
    }

    //
    // insurance bills
    var ic = data.company.AdminManagement.InsuranceCosts;

    //employee insurance
    if (isToday(ic.EmployeeLiability.billPaymentDue)) {
        ic.EmployeeLiability.billPaid = true;
        payBill(ic.EmployeeLiability.annualCosts);
        console.log("STATE LOG: OUTGOING - Employee Insurance Bill paid. New bank balance: " + fin.bankBalance.toFixed(2));
    }
    if (ic.EmployeeLiability.billPaid) {
        addYearBillDate(ic.EmployeeLiability.billPaymentDue);
        ic.EmployeeLiability.billPaid = false;
    }

    //public insurance
    if (isToday(ic.PublicLiability.billPaymentDue)) {
        ic.PublicLiability.billPaid = true;
        payBill(ic.PublicLiability.annualCosts);
        console.log("STATE LOG: OUTGOING - Public Insurance Bill paid. New bank balance: " + fin.bankBalance.toFixed(2));
    }
    if (ic.PublicLiability.billPaid) {
        addYearBillDate(ic.PublicLiability.billPaymentDue);
        ic.PublicLiability.billPaid = false;
    }

    //contents insurance
    if (isToday(ic.ContentsInsurance.billPaymentDue)) {
        ic.ContentsInsurance.billPaid = true;
        payBill(ic.ContentsInsurance.annualCosts);
        console.log("STATE LOG: OUTGOING - Contents Insurance Bill paid. New bank balance: " + fin.bankBalance.toFixed(2));
    }
    if (ic.ContentsInsurance.billPaid) {
        addYearBillDate(ic.ContentsInsurance.billPaymentDue);
        ic.ContentsInsurance.billPaid = false;
    }



    //yearly shop costs
    var sc = data.company.Resources.ShopCosts;

    //rates
    if (isToday(sc.Rates.billPaymentDue)) {
        sc.Rates.billPaid = true;
        payBill(sc.Rates.costs);
        console.log("STATE LOG: OUTGOING - Rates Bill paid. New bank balance: " + fin.bankBalance.toFixed(2));
    }
    if (sc.Rates.billPaid) {
        addYearBillDate(sc.Rates.billPaymentDue);
        sc.Rates.billPaid = false;
    }

    //stationary
    if (isToday(sc.Stationary.billPaymentDue)) {
        sc.Stationary.billPaid = true;
        payBill(sc.Stationary.costs);
        console.log("STATE LOG: OUTGOING - Stationary Bill paid. New bank balance: " + fin.bankBalance.toFixed(2));
    }
    if (sc.Stationary.billPaid) {
        addYearBillDate(sc.Stationary.billPaymentDue);
        sc.Stationary.billPaid = false;
    }

    //branded bags
    if (isToday(sc.BrandedCarrierBags.billPaymentDue)) {
        sc.BrandedCarrierBags.billPaid = true;
        payBill(sc.BrandedCarrierBags.costs);
        console.log("STATE LOG: OUTGOING - Carrier Bags Bill paid. New bank balance: " + fin.bankBalance.toFixed(2));
    }
    if (sc.BrandedCarrierBags.billPaid) {
        addYearBillDate(sc.BrandedCarrierBags.billPaymentDue);
        sc.BrandedCarrierBags.billPaid = false;
    }

    //business cards
    if (isToday(sc.BusinessCards.billPaymentDue)) {
        sc.BusinessCards.billPaid = true;
        payBill(sc.BusinessCards.costs);
        console.log("STATE LOG: OUTGOING - Business Cards Bill paid. New bank balance: " + fin.bankBalance.toFixed(2));
    }
    if (sc.BusinessCards.billPaid) {
        addYearBillDate(sc.BusinessCards.billPaymentDue);
        sc.BusinessCards.billPaid = false;
    }

    //shop maintenance
    if (isToday(sc.ShopMaintenance.billPaymentDue)) {
        sc.ShopMaintenance.billPaid = true;
        payBill(sc.ShopMaintenance.costs);
        console.log("STATE LOG: OUTGOING - Shop Maintenance Bill paid. New bank balance: " + fin.bankBalance.toFixed(2));
    }
    if (sc.ShopMaintenance.billPaid) {
        addYearBillDate(sc.ShopMaintenance.billPaymentDue);
        sc.ShopMaintenance.billPaid = false;
    }

    //EPOS software
    if (isToday(sc.SoftwareEPOS.billPaymentDue)) {
        sc.SoftwareEPOS.billPaid = true;
        payBill(sc.SoftwareEPOS.costs);
        console.log("STATE LOG: OUTGOING - EPOS Software Bill paid. New bank balance: " + fin.bankBalance.toFixed(2));
    }
    if (sc.SoftwareEPOS.billPaid) {
        addYearBillDate(sc.SoftwareEPOS.billPaymentDue);
        sc.SoftwareEPOS.billPaid = false;
    }

    //staff items
    if (isToday(sc.StaffItems.billPaymentDue)) {
        sc.StaffItems.billPaid = true;
        payBill(sc.StaffItems.costs);
        console.log("STATE LOG: OUTGOING - Staff adhoc Items Bill paid. New bank balance: " + fin.bankBalance.toFixed(2));
    }
    if (sc.StaffItems.billPaid) {
        addYearBillDate(sc.StaffItems.billPaymentDue);
        sc.StaffItems.billPaid = false;
    }

    //website costs
    var wc = data.company.Resources.WebsiteCosts;

    if (isToday(wc.billPaymentDue)) {
        wc.billPaid = true;
        var totalCost = (wc.changeCosts + wc.domainCosts + wc.hostingCosts);
        payBill(totalCost);
        console.log("STATE LOG: OUTGOING - Website Maintenance Bill paid. New bank balance: " + fin.bankBalance.toFixed(2));
    }
    if (wc.billPaid) {
        addYearBillDate(wc.billPaymentDue);
        wc.billPaid = false;
    }

    //yearly advertisement bills
    var mcr = data.company.MarketingCustomerRelations;

    //paper advertisement
    if (isToday(mcr.HardAdvertisement.dateOfRenewal)) {
        mcr.HardAdvertisement.billPaid = true;
        payBill(mcr.HardAdvertisement.cost);
        console.log("STATE LOG: OUTGOING - Newspaper Ad Bill paid. New bank balance: " + fin.bankBalance.toFixed(2));
    }
    if (mcr.HardAdvertisement.billPaid) {
        addYearBillDate(mcr.HardAdvertisement.dateOfRenewal);
        mcr.HardAdvertisement.billPaid = false;
    }

    //online advertisement
    if (isToday(mcr.SoftAdvertisement.dateOfRenewal)) {
        mcr.SoftAdvertisement.billPaid = true;
        payBill(mcr.SoftAdvertisement.cost);
        console.log("STATE LOG: OUTGOING - Online ad Bill paid. New bank balance: " + fin.bankBalance.toFixed(2));
    }
    if (mcr.SoftAdvertisement.billPaid) {
        addYearBillDate(mcr.SoftAdvertisement.dateOfRenewal);
        mcr.SoftAdvertisement.billPaid = false;
    }


    //monthly bills

    //shop insurance
    if (isToday(sc.ShopInsurance.billDayDue)) {
        sc.ShopInsurance.billPaid = true;
        payBill(sc.ShopInsurance.costs);
        console.log("Old Shop Insurance Bill date: " + sc.ShopInsurance.billDayDue);
        console.log("STATE LOG: OUTGOING - Shop Insurance Bill paid. New bank balance: " + fin.bankBalance.toFixed(2));
    }
    if (sc.ShopInsurance.billPaid) {
        addMonthBillDate(sc.ShopInsurance.billDayDue);
        sc.ShopInsurance.billPaid = false;
        console.log("New Shop Insurance bill date: " + sc.ShopInsurance.billDayDue);
    }

    //electricity
    if (isToday(sc.Electricity.billDayDue)) {
        sc.Electricity.billPaid = true;
        payBill(sc.Electricity.costs);
        console.log("Old Electricity Bill date: " + sc.Electricity.billDayDue);
        console.log("STATE LOG: OUTGOING - Electricity Bill paid. New bank balance: " + fin.bankBalance.toFixed(2));
    }
    if (sc.Electricity.billPaid) {
        addMonthBillDate(sc.Electricity.billDayDue);
        sc.Electricity.billPaid = false;
        console.log("New Electricity bill date: " + sc.Electricity.billDayDue);
    }

    //mortgage bill
    if (isToday(sc.Mortgage.billDayDue)) {
        sc.Mortgage.billPaid = true;
        payBill(sc.Mortgage.costs);
        console.log("Old mortgage bill date: " + sc.Mortgage.billDayDue);
        console.log("STATE LOG: OUTGOING - Mortgage Bill paid. New bank balance: " + fin.bankBalance.toFixed(2));
    }
    if (sc.Mortgage.billPaid) {
        addMonthBillDate(sc.Mortgage.billDayDue);
        sc.Mortgage.billPaid = false;
        console.log("New mortgage bill date: " + sc.Mortgage.billDayDue);
    }

    //cleaning
    if (isToday(sc.Cleaning.billDayDue)) {
        sc.Cleaning.billPaid = true;
        payBill(sc.Cleaning.costs);
        console.log("STATE LOG: OUTGOING - Cleaning Bill paid. New bank balance: " + fin.bankBalance.toFixed(2));
    }
    if (sc.Cleaning.billPaid) {
        addMonthBillDate(sc.Cleaning.billDayDue);
        sc.Cleaning.billPaid = false;
    }

    //telecoms
    if (isToday(sc.Telecoms.billDayDue)) {
        sc.Telecoms.billPaid = true;
        payBill(sc.Telecoms.costs);
        console.log("STATE LOG: OUTGOING - Telecoms Bill paid. New bank balance: "
            + fin.bankBalance.toFixed(2));
    }
    if (sc.Telecoms.billPaid) {
        addMonthBillDate(sc.Telecoms.billDayDue);
        sc.Telecoms.billPaid = false;
    }


    //company house filing
    var comp = data.company.AdminManagement.Compliance;
    let randomMonth = Math.floor(Math.random() * 6);

    //if filing is due, send a reminder
    if (isToday(comp.companyHouseDueDate)) {
        comp.reminderReceived = true;
        console.log("Company House reminder sent.");
    }

    //if a reminder has been received, the filing date will update to the future with a random value
    if (comp.reminderReceived) {
        comp.companyHouseFileDate.setMonth(comp.companyHouseDueDate.getMonth() + randomMonth);
        comp.reminderReceived = false;
        comp.monthsLate = randomMonth;
        console.log("New Company House file date set: " + comp.companyHouseFileDate);
    }

    if (isToday(comp.companyHouseFileDate)) {

        //if filed date is < 1 month fine is £150
        //if filed date is > 1 month and < 3 months fine is £375
        //if filed date is > 3 month and < 6 months fine is £750
        //if filed date is > 6 months fine is £1500
        switch (true) {
            case comp.monthsLate < 1:
                payBill(comp.penaltyFeeOneMonth);
                payBill(comp.generalFee);
                console.log("STATE LOG: OUTGOING - Bill paid COMPANY HOUSE. New bank balance: " + fin.bankBalance.toFixed(2));
                break;

            case comp.monthsLate > 1 && comp.monthsLate < 3:
                payBill(comp.penaltyFeeThreeMonths);
                payBill(comp.generalFee);
                console.log("STATE LOG: OUTGOING - Bill paid COMPANY HOUSE. New bank balance: " + fin.bankBalance.toFixed(2));
                break;

            case comp.monthsLate > 3 && comp.monthsLate < 6:
                payBill(comp.penaltyFeeSixMonths);
                payBill(comp.generalFee);
                console.log("STATE LOG: OUTGOING - Bill paid COMPANY HOUSE. New bank balance: " + fin.bankBalance.toFixed(2));
                break;

            case comp.monthsLate > 6:
                payBill(comp.penaltyFeeSixMonthsPlus);
                payBill(comp.generalFee);
                console.log("STATE LOG: OUTGOING - Bill paid COMPANY HOUSE. New bank balance: " + fin.bankBalance.toFixed(2));
                break;

            default:
                payBill(comp.generalFee);
                console.log("STATE LOG: OUTGOING - Bill paid COMPANY HOUSE. New bank balance: " + fin.bankBalance.toFixed(2));
                break;
        }

        //set due date for next year 
        addYearBillDate(comp.companyHouseDueDate);
    }

    //Test for bankrupcy//breakeven

    if (fin.Turnover.annualLoss == fin.Turnover.annualProfit) {
        fin.Turnover.breakEven = true;
        console.log("Company has broken even");
    }
    // bank balance after bills:
    console.log("STATE LOG: Bank Balance (after bills): " + fin.bankBalance.toFixed(2));
    console.log("STATE LOG: Annual Profit: " + fin.Turnover.annualProfit.toFixed(2));
    console.log("STATE LOG: Annual Loss: " + fin.Turnover.annualLoss.toFixed(2));

}


//check date is today function
function isToday(date) {
    const checkDate = new Date(date);
    const todayDate = data.date;

    if (checkDate.getDate() === todayDate.getDate() &&
        checkDate.getMonth() === todayDate.getMonth()) {
        return true;
    } else {
        return false;
    }
}

//Pay bill function - take away from bank account and add to annual loss.
//Print message to console if company going bankrupt.
function payBill(cost) {
    var fin = data.company.Finances;

    if (fin.bankBalance > cost) {

        fin.bankBalance -= cost;
        fin.Turnover.annualLoss += cost;
    } else {
        fin.bankBalance -= cost;
        fin.Turnover.annualLoss += cost;
        console.log("Bill paid - bank balance below 0"
            + " - not enough funds. File bankruptcy.");
    }
}

//function to add a year to the bill date
function addYearBillDate(billDate) {
    billDate.setFullYear(billDate.getFullYear() + 1);
}

//function to add a month to the bill date
function addMonthBillDate(billDate) {
    billDate.setMonth(billDate.getMonth() + 1);
}

//function to check if it's the last day of the month
function isLastDayOfMonth(date = new Date()) {
    var oneDayInMs = 1000 * 60 * 60 * 24;

    return new Date(date.getTime() + oneDayInMs).getDate() === 1;
}
