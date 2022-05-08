// time calculations

const secInMs = 1000;
const minInMs = secInMs * 60;
const hourInMs = minInMs * 60;
const dayInMs = hourInMs * 24;
const weekInMs = dayInMs * 7;
const yearInMs = dayInMs * 365;

//random number functions
function xmur3(str) {
	for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
		h = Math.imul(h ^ str.charCodeAt(i), 3432918353),
			h = h << 13 | h >>> 19;
	return function () {
		h = Math.imul(h ^ h >>> 16, 2246822507);
		h = Math.imul(h ^ h >>> 13, 3266489909);
		return (h ^= h >>> 16) >>> 0;
	}
}
function sfc32(a, b, c, d) {
	return function () {
		a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
		var t = (a + b) | 0;
		a = b ^ b >>> 9;
		b = c + (c << 3) | 0;
		c = (c << 21 | c >>> 11);
		d = d + 1 | 0;
		t = t + d | 0;
		c = c + t | 0;
		return (t >>> 0) / 4294967296;
	}
}
function mulberry32(a) {
	return function () {
		var t = a += 0x6D2B79F5;
		t = Math.imul(t ^ t >>> 15, t | 1);
		t ^= t + Math.imul(t ^ t >>> 7, t | 61);
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	}
}
function xoshiro128ss(a, b, c, d) {
	return function () {
		var t = b << 9, r = a * 5; r = (r << 7 | r >>> 25) * 9;
		c ^= a; d ^= b;
		b ^= c; a ^= d; c ^= t;
		d = d << 11 | d >>> 21;
		return (r >>> 0) / 4294967296;
	}
}
let seedFunction = xmur3("Anything");
let seed0 = seedFunction();
let seed1 = seedFunction();
let seed2 = seedFunction();
let seed3 = seedFunction();
let seededRandFunction = sfc32(seed0, seed1, seed2, seed3);

//probability variables - can be adjusted
var likelihoodOfRepeatVisit = 0.2;
var increasedProbOfVisitLoyaltyCard = 0.3;
var increasedProbOfVisitLoyaltyVisit = 0.4;
var increasedProbOfVisitSocialPost = 0.4;
var increasedProbOfVisitPayDay = 0.2;
var increasedProbOfVisitBirthday = 0.3;
var increasedProbOfVisitSpecialDay = 0.2;
var chanceOfBuyingTheSameThingAsLastTime = 0.2;
var decreasedProbOfPurchaseBudget = 0.9;
var chanceOfBuyingDiscount = 0.3;
var increasedProbOfTip = 0.1;
var chanceOfLateVendorPayment = 0.5;
var increasedProbOfStaffSickness = 0.01;
var increasedProbOfLeave = 0.1;
var increasedProbOfOTDays = 0.4;
var increasedProbOfOTEmployees = 0.2;
var increasedProbPayUnion = 0.1;
var increasedProbPayFt = 0.1;
var increasedProbPayStart = 0.1;
var increasedProbPayYear = 0.1;
var increasedProbPayProductivityRating = 0.1;
var increasedProbDismissalProductivity = 0.1;
var increasedProbDismissalSickness = 0.1;

//var date = data.date;

//main simulation function
function simulate_tick(data) {

	console.log("******************************************************************");

	//increase day
	data.date = addDays(data.date, 1);
	console.log("Day date: " + data.date);


	//check if a new year - some values need reset
	var newYear = new Date('1900-01-01T00:00:00');

	if (isToday(newYear)) {

		console.log("Happy new year - values resetting.");
		data.company.Finances.Banking.Outgoing.staffPayrollYearly = 0;

		for (let w in data.company.Employees) {
			let emps = data.company.Employees[w];
			emps.sickDays = 0;
			emps.leaveTaken = 0;
		}

	}

	//Check finances before any events have taken place
	let finances = data.company.Finances;
	console.log("STATE LOG: Bank Balance at start of day: £" + finances.bankBalance.toFixed(2));

	// Check likelihood of a staff member being off sick / on annual leave

	//set staff on shift to 0
	data.company.employeesOnShift = 0;

	for (let q in data.company.Employees) {
		let e = data.company.Employees[q];

		//check if a staff member is supposed to be on shift

		let staffSicknessProb = 0;
		var lowWorkerSat = 6.5;


		if (e.workingDays.includes(data.date.getDay())) {

			//check the probablility of a staff member being off sick
			//if their worker satisfaction is low
			//if their sick leave is <= 2 days or >= 5 days
			if ((e.sickDays <= 2 || e.sickDays >= 5) || (e.employeeSatisfaction.workerSatisfactionRating <= lowWorkerSat)) {
				staffSicknessProb += increasedProbOfStaffSickness;
			}

			let staffSample = seededRandFunction();

			if (staffSicknessProb > staffSample) {
				//staff member is off sick
				console.log(e.employeeName + " is off sick. EmployeeSample: " + staffSicknessProb + " exampleSample: " + staffSample);
				e.sickDays += 1;
				e.shiftStatus = false;
				if (e.employeeBenefits == false) {
					//if they don't have employee benefits, their sick day will be taken from pay
					console.log(e.employeeName + " does not have benefits - pay deducted");
					e.deductions += e.salaryPerDay;
				}
			} else {

				//check probability of staff member being on annual leave
				//if they have none left, they can't be on leave
				if (e.leaveTaken >= e.leaveEntitlement) {
					e.leaveStatus = false;
					e.shiftStatus = true;
					data.company.employeesOnShift += 1;
				} else {

					//if their hours taken is < 50% of their entitlement, increased probability
					var annualLeaveProb = 0.0;
					var percentSample = 50;
					var percentLeave = (100 * e.leaveTaken) / e.leaveEntitlement;

					if (percentLeave <= percentSample) {
						annualLeaveProb += increasedProbOfLeave;
					}

					let leaveSample = seededRandFunction();

					if (annualLeaveProb > leaveSample) {
						//they are on leave and off shift
						e.leaveStatus = true;
						e.shiftStatus = false;
						e.leaveTaken += 7.5;
						console.log(e.employeeName + " is off on leave. Leave taken is: " + e.leaveTaken);
					} else {
						//they are on shift
						console.log(e.employeeName + " is on shift today.");
						e.shiftStatus = true;
						e.leaveStatus = false;
						data.company.employeesOnShift += 1;
					}
				}
			}


			//check if a shop employee is doing any OT
			if ((e.shiftStatus == true) && (e.employeeType == "General Manager" || e.employeeType == "Team Lead" || e.employeeType == "Store Assistant")) {

				var otProb = 0.0;

				//Check if it's a Friday or Saturday
				if (data.date.getDay() == 5 || data.date.getDay() == 6) {
					otProb += increasedProbOfOTDays;
				}

				//Check if there are a low number of employees on
				if (data.company.employeesOnShift <= 2) {
					otProb += increasedProbOfOTEmployees;
				}

				let otSample = seededRandFunction();

				if (otProb > otSample) {

					var otHours = getRandNum(1, 3);
					e.overtime += otHours;
					e.overtimePay += ((e.salaryPerDay / otHours) * 0.20);
				}

			}

		} else {
			e.shiftStatus = false;
		}

	}

	//check if no one is on shift - then the shop will have to close

	var statusArr = [];
	for (let r in data.company.Employees) {
		let e = data.company.Employees[r];

		//check if a member of shop staff
		if (e.employeeType == "General Manager" || e.employeeType == "Team Lead" || e.employeeType == "Store Assistant") {

			if (e.shiftStatus == true) {
				statusArr.push(e.shiftStatus);
			}
		}
	}

	//Posting a social media post/advertisement

	let sm = data.company.MarketingCustomerRelations.socialMediaPosts;

	//post to facebook if Tuesday
	if (data.date.getDay() == 2) {
		for (let z in sm) {
			let post = sm[z];

			if (post.platform == "facebook") {

				//generate random numbers for views, likes and comments.
				console.log("It's Tuesday - posting to Facebook.");
				post.dateOfPost = data.date;
				let uniqueViews = getRandNum(0, 9000);
				let likes = getRandNum(0, 5000);
				let comments = getRandNum(0, 1000);
				post.uniqueViews = uniqueViews;
				post.likes = likes;
				post.comments = comments;
				data.company.socialPosts += 1;
				console.log("Unique views: " + post.uniqueViews + " likes: " + post.likes + " comments: " + post.comments);
			}
		}

		//post to instagram if it's thursday

	} else if (data.date.getDay() == 4) {

		for (let y in sm) {
			let post = sm[y];

			if (post.platform == "instagram") {
				console.log("It's Thursday - posting to Instagram.");
				post.dateOfPost = data.date;
				let uniqueViews = getRandNum(0, 9000);
				let likes = getRandNum(0, 5000);
				let comments = getRandNum(0, 1000);
				post.uniqueViews = uniqueViews;
				post.likes = likes;
				post.comments = comments;
				data.company.socialPosts += 1;

				console.log("Unique views: " + post.uniqueViews + " likes: " + post.likes + " comments: " + post.comments);
			}
		}
	} else {
		console.log("No social posts today.");
	}

	//check if raw supplies need delivered
	//raw materials will be reduced every time products are baked by kitchen
	let aM = data.company.AdminManagement;
	let stockMin = 30;
	let stockMax = 80;

	console.log("RAW MATERIAL SUPPLIES: " + aM.Bakery.rawMaterialsStock);

	if (aM.Bakery.rawMaterialsStock < stockMin && aM.Bakery.scheduleMaterialsDelivery == false) {
		aM.Bakery.scheduleMaterialsDelivery = true;
		//takes 2 days for raw material delivery

		aM.Bakery.expectedDeliveryDate = addDays(data.date, 2);
		console.log("New supplies expected delivery date: " + aM.Bakery.expectedDeliveryDate)
	}

	if ((aM.Bakery.scheduleMaterialsDelivery) && (isToday(aM.Bakery.expectedDeliveryDate))) {
		aM.Bakery.rawSuppliesDelivered = true;
		aM.Bakery.rawMaterialsStock += stockMax;
		console.log("Raw materials delivered : " + aM.Bakery.rawMaterialsStock);

		//pay supplier - Outgoing & take away from bank balance
		console.log("STATE LOG: Bank Balance before raw material supplier paid:  £" + finances.bankBalance.toFixed(2));
		data.company.Finances.Banking.Outgoing.supplierCosts += aM.Bakery.rawMaterialsCostPerDelivery;
		data.company.Finances.bankBalance -= aM.Bakery.rawMaterialsCostPerDelivery;
		data.company.Finances.Turnover.annualLoss += aM.Bakery.rawMaterialsCostPerDelivery;

		console.log("STATE LOG: OUTGOING Bank Balance after raw materials supplier paid: £" + finances.bankBalance.toFixed(2));

		//reset delivery values
		aM.Bakery.scheduleMaterialsDelivery = false;
		aM.Bakery.rawSuppliesDelivered = false;
	}

	//check if any products are out of stock and need to be baked by bakery staff
	//products will also be reduced if low in stock
	var lowStock = 3;
	var discountStock = 8;
	var discount = 0.00;

	for (let l in data.company.Products) {
		let p = data.company.Products[l];

		if (p.numInStock <= 3) {
			console.log(p.productName + "Low Product stock: " + p.numInStock);
		}
		if (p.numInStock <= lowStock && p.outOfStock == false) {

			p.outOfStock = true;
			console.log(p.productName + " is out of stock.");

			//send reminder to Bakers
			aM.Management.Stock.reminderToKitchen = true;
			aM.Bakery.rawMaterialsStock -= p.numRawMaterialsPerBake;
			console.log("Product baking time: " + p.timeToBake);

			//set baking finish time
			p.bakingFinishTime = addDays(data.date, p.timeToBake);
			console.log("New baking time: " + p.bakingFinishTime);

		}
		//check if low stock, apply 30% discount to remaining stock
		if (p.numInStock <= discountStock && p.numInStock > lowStock && p.discount == 0) {
			discount = (p.productSalePrice * 0.30);
			console.log(p.productName + " has been discounted: " + p.discount
				+ " Full price is now: £" + (p.productSalePrice - p.discount));
		}
	}


	//check if product baking times have finished
	for (let m in data.company.Products) {
		let p = data.company.Products[m];

		if ((isToday(p.bakingFinishTime))) {
			console.log("Baking time has finished.");
			//add to stock and volume made
			p.numInStock += p.bakedEachTime;
			p.volumeMadePerYear += p.bakedEachTime;
			p.totalPackagingCost += (p.bakedEachTime * p.packagingCost);
			p.outOfStock = false;
			//set discount back to 0
			p.discount = 0;
			console.log(p.productName + " is back in stock: " + p.numInStock);
			aM.Management.Stock.reminderToKitchen = true;

			//post to the website that products are back in stock
			for (let z in sm) {
				let post = sm[z];

				if (post.platform == "website") {
					console.log("Products back in stock - posting on Website.");
					post.dateOfPost = data.date;
					let uniqueViews = getRandNum(0, 9000);
					let likes = getRandNum(0, 5000);
					let comments = getRandNum(0, 1000);
					post.uniqueViews = uniqueViews;
					post.likes = likes;
					post.comments = comments;
					data.company.socialPosts += 1;
					console.log("Unique views: " + post.uniqueViews +
						" likes: " + post.likes + " comments: " + post.comments);
				}
			}

		}
	}
	if (statusArr.length >= 1) {
		//Employees on-shift - shop is open

		var totalCustomersToday = 0;
		var custNum = 0;
		//Potential customers visiting/ buying things

		for (let i in data.company.Customers) {

			let c = data.company.Customers[i];
			//set visiting probability to 0
			let probabilityOfVisiting = 0.0;

			//More likely to visit at the same time of the week visited before
			let timeSinceLastVisit = ((data.date - c.dateOfVisit) / dayInMs);
			console.log("Days since last visit: " + timeSinceLastVisit);

			//checking if timeSinceLastVisit is at a similar time, increase probability if so
			if (timeSinceLastVisit > 6.5 && timeSinceLastVisit < 7.8) {
				probabilityOfVisiting += likelihoodOfRepeatVisit;
			}

			//If they saw a social media post that day, increase likelihood of a visit
			for (let j in data.company.MarketingCustomerRelations.socialMediaPosts) {
				let m = data.company.MarketingCustomerRelations.socialMediaPosts[j];

				if (c.socialMediaUser && isToday(m.dateOfPost)) {
					probabilityOfVisiting += increasedProbOfVisitSocialPost;
				}
			}

			//Have been paid within the last 2 days, increase visit likelihood
			var dayDate = new Date(data.date);

			if (dayCompareTwoDayPeriod(dayDate, c.datePaid)) {
				probabilityOfVisiting += increasedProbOfVisitPayDay;
			}

			//Have a loyalty card - increase visit likelihood
			if (c.loyaltyCard) {
				probabilityOfVisiting += increasedProbOfVisitLoyaltyCard;
			}

			//have 30+ loyalty visits - increase visit likelihood
			if (c.loyaltyVisitNumber > 30) {
				probabilityOfVisiting += increasedProbOfVisitLoyaltyVisit;
			}

			//Customer's birthday - increase visit likelihood
			var birthday = new Date(c.customerDOB);
			var todayDate = new Date(data.date);

			if (dayMonthCompare(todayDate, birthday)) {
				probabilityOfVisiting += increasedProbOfVisitBirthday;
			}

			//Valentines day  - increase visit likelihood
			var valentines = new Date('2022-02-14T00:00:00')
			if (dayMonthCompare(todayDate, valentines)) {
				probabilityOfVisiting += increasedProbOfVisitSpecialDay;

			}

			//st patrick's day  - increase visit likelihood
			var paddys = new Date('2022-03-17T00:00:00')
			if (dayMonthCompare(todayDate, paddys)) {
				probabilityOfVisiting += increasedProbOfVisitSpecialDay;
			}

			//national cupcake day Dec 15  - increase visit likelihood
			var nationalCupcakeDay = new Date('2022-12-15T00:00:00')
			if (dayMonthCompare(todayDate, nationalCupcakeDay)) {
				probabilityOfVisiting += increasedProbOfVisitSpecialDay;
			}

			//Test if the event occured
			let randomSample = seededRandFunction();


			if (probabilityOfVisiting > randomSample) {

				//The customer has visited
				console.log(c.name + " visited the cafe");
				data.company.customersVisit += 1;

				//keep track of how many customers visited today 
				totalCustomersToday += 1;
				let totalSpent = 0;


				for (let pi in data.company.Products) {

					let product = data.company.Products[pi];

					//Check if it is possible to buy it, and total spent is less than the customer budget
					var availableToBuy = 0;
					if ((product.numInStock > availableToBuy) && (totalSpent <= c.customerBudget)) {
						let probabilityOfBuying = probOfBuyingProduct(c, product);
						let productRandomSample = seededRandFunction();

						if (probabilityOfBuying > productRandomSample) {
							//customer has bought the product

							console.log("Product bought: " + product.productName);
							product.numInStock -= custNum;
							product.totalSale += custNum;
							product.volumeSoldPerYear += custNum;

							//add product to list bought by customer if not already there

							if (!arrayCheck(product.productName, c.productsBought)) {
								c.productsBought.push(product.productName);
							}

							//need to account for any seasonal discount applied here
							totalSpent += (product.productSalePrice - product.discount);

							//add to total sale
							product.totalSale += totalSpent;
							console.log("Total Spent: £" + totalSpent);
						}
					}
				}


				//Update the records for the customer based on everything they have bought
				if (c.numProductsBought < c.productsBought.length) {
					c.numProductsBought += c.productsBought.length;
				}

				// calculate likelihood of leaving a tip - if they spent less than their budget
				let probabilityOfTipping = 0.0;
				if (totalSpent <= c.customerBudget) {
					probabilityOfTipping += increasedProbOfTip;
				}

				//Test if customer tip event occurred
				let randomSampleTip = seededRandFunction();
				var totalTip = 0;
				if (probabilityOfTipping > randomSampleTip) {
					//tip is 20%
					totalTip = (totalSpent * 0.20);
					c.tipAmount += totalTip;

				}

				//add visit to customer loyalty card
				if (c.loyaltyCard = true) {
					c.loyaltyVisitNumber += 1;
				}

				//update customer record after visit
				c.dateOfVisit = data.date;
				c.visitedBefore = true;
				c.customerStatus = "returning";

				//Pay the company the money - add to bank balance and annual profit and sales income
				console.log("STATE LOG: INGOING Bank Balance before customer pays: £" + finances.bankBalance.toFixed(2));
				data.company.Finances.bankBalance += totalSpent;
				data.company.Finances.Turnover.annualProfit += totalSpent;
				data.company.Finances.Banking.Ingoing.totalProductSaleIncome += totalSpent;
				//calculate tips
				data.company.Finances.Banking.Ingoing.totalTips += totalTip;

				console.log("STATE LOG: INGOING Bank Balance after customer pays: £" + finances.bankBalance.toFixed(2));

				// console.log("New Finances: Bank Balance £" + data.company.Finances.bankBalance);
				// console.log("New Finances: Annual Profit £" + data.company.Finances.Turnover.annualProfit);
				// console.log("New Finances: Total Product Sale Income £" + data.company.Finances.Banking.Ingoing.totalProductSaleIncome);
				// console.log("New Finances: Tips £" + data.company.Finances.Banking.Ingoing.totalTips);

			}
		}

		console.log("Number of customers visited today: " + totalCustomersToday);


		//every Wednesday a vendor purchases products at a reduced price to sell 
		//in their shops, which is delivered on Friday
		var totalVendorPurchase = 0;
		var totalVendorCharge = 0;

		//baked every Wednesday to be ready for Friday delivery
		if (data.date.getDay() == 3) {

			for (let n in data.company.Products) {
				let p = data.company.Products[n];

				totalVendorPurchase += p.purchasedByVendor;
				totalVendorCharge += (p.vendorPrice * p.purchasedByVendor);
				aM.Management.Vendor.vendorCurrentBill = totalVendorCharge;
			}
			aM.Management.Vendor.vendorReminderToKitchen = true;
			console.log("It's Wednesday - Vendor has purchased: "
				+ totalVendorPurchase + " For £" + totalVendorCharge);
		}

		//if today is Friday, the products will be baked and ready for delivery
		if (data.date.getDay() == 5) {

			for (let o in data.company.Products) {
				let p = data.company.Products[o];
				p.volumeMadePerYear += p.purchasedByVendor;
				p.volumeSoldPerYear += p.purchasedByVendor;

			}
			aM.Management.Vendor.vendorProductsDelivered = true;
			aM.Management.Vendor.vendorReminderToKitchen = false;
			aM.Management.Vendor.vendorPaymentReminderSent = true;
			aM.Management.Vendor.vendorCurrentBill += totalVendorCharge;
			console.log("It's Friday - products delivered to vendor.")
			data.company.vendorSales += 1;


			//vendor needs to pay immediately or a late fee will incur
			let randomVendorLateSample = seededRandFunction();
			console.log("Vendor late payment sample: " + randomVendorLateSample);

			if (chanceOfLateVendorPayment < randomVendorLateSample && aM.Management.Vendor.vendorPaymentReminderSent) {
				aM.Management.Vendor.vendorPaymentReceived = true;
				console.log("Vendor payment received.");

				//put money into company bank account  -Ingoing
				console.log("STATE LOG: INGOING Before payment from vendor: £" + finances.bankBalance.toFixed(2));
				console.log("Vendor bill: " + aM.Management.Vendor.vendorCurrentBill);
				data.company.Finances.Banking.Ingoing.externalSupplierIncome += aM.Management.Vendor.vendorCurrentBill;
				data.company.Finances.bankBalance += aM.Management.Vendor.vendorCurrentBill;
				data.company.Finances.Turnover.annualProfit += aM.Management.Vendor.vendorCurrentBill;
				console.log("STATE LOG: INGOING Payment from vendor - no late fee: £" + finances.bankBalance.toFixed(2));

			} else {
				//payment is late
				aM.Management.Vendor.vendorLateReminderSent = true;
				aM.Management.Vendor.vendorCurrentBill += aM.Management.Vendor.vendorLateFee;
				console.log("Vendor payment late.");
				aM.Management.Vendor.vendorPaymentReceived = true;

				//put money into company bank account  -Ingoing
				console.log("STATE LOG: INGOING Before payment from vendor + late fee: £" + finances.bankBalance.toFixed(2));
				console.log("Total Vendor bill: " + (aM.Management.Vendor.vendorCurrentBill));
				data.company.Finances.Banking.Ingoing.externalSupplierIncome += (aM.Management.Vendor.vendorCurrentBill);
				data.company.Finances.bankBalance += (aM.Management.Vendor.vendorCurrentBill);
				data.company.Finances.Turnover.annualProfit += (aM.Management.Vendor.vendorCurrentBill);

				console.log("STATE LOG: INGOING Payment from vendor + late fee: £" + finances.bankBalance.toFixed(2));
			}
		}

		if (aM.Management.Vendor.vendorPaymentReceived) {
			//reset vendor values
			aM.Management.Vendor.vendorPaymentReminderSent = false;
			aM.Management.Vendor.vendorCurrentBill = 0.00;
			aM.Management.Vendor.vendorProductsDelivered = false;
			aM.Management.Vendor.vendorPaymentReceived = false;
			aM.Management.Vendor.vendorLateReminderSent = false;
			aM.Management.Vendor.vendorPaymentReceived = false;
		}

		//event - giving a staff member a payrise
		//event - sacking an employee

		for (let s in data.company.Employees) {
			let e = data.company.Employees[s];

			if (e.status == "Active") {

				//calculate probability of getting a payrise
				let probabilityOfPayRise = probOfPayrise(e);
				let payriseRandSample = seededRandFunction();

				//check to make sure they havent already been given a payrise in past 2 years
				let timeSinceLastPayrise = data.date - e.lastPayriseDate;
				let yearSincePayrise = 2;


				if (timeSinceLastPayrise >= (yearSincePayrise * yearInMs)) {

					if (probabilityOfPayRise > payriseRandSample) {

						//employee is getting a payrise 
						console.log(e.employeeName + " is getting a payrise");

						//check what their salary is and assign payrise accordingly
						let salary = e.salary;
						let salaryIncrease = 0;
						let salaryband1 = 20000;
						let salaryband2 = 25000;

						switch (true) {
							case salary < salaryband1:
								salaryIncrease = 0.02;
								console.log("Salary increase of: " + salaryIncrease);
								break;
							case salary < salaryband2:
								salaryIncrease = 0.025;
								console.log("Salary increase of: " + salaryIncrease);
								break;
							case salary >= salaryband2:
								salaryIncrease = 0.035;
								console.log("Salary increase of: " + salaryIncrease);
								break;
							default:
								salaryIncrease = 0;
								console.log("No salary increase.");
								break;
						}

						//update employee salary info
						e.salary = e.salary + (e.salary * salaryIncrease);
						e.lastPayriseDate = data.date;
						e.salaryPerDay = ((e.salary / 52) / 5).toFixed(2);

					}
				}

				//probability of sacking an employee

				let probabilityOfDismissal = probOfDismissal(e);
				let dismissalRandSample = seededRandFunction();

				if (e.employeeType != "Director") {

					if (probabilityOfDismissal > dismissalRandSample) {
						//employee is fired and becomes inactive
						console.log(e.employeeName + " has been fired.");
						e.status = "Inactive";
					}
				}

			}

		}

		//reminder to send out employee satisfaction surveys
		let es = data.company.AdminManagement.Management.EmployeeSatisfaction;
		surveyDate = es.annualSurveyDate;


		if (isToday(es.annualSurveyDate)) {
			//if surveys haven't been sent, send the survey and populate received date for each employee.
			console.log("Dates match");

			if (es.surveySent == false) {
				es.surveySentDate = data.date;
				console.log("Employee satisfaction surveys sent.")
				es.surveySent = true;

				for (let t in data.company.Employees) {
					let e = data.company.Employees[t];

					if (e.status == "Active" && e.employeeType != "Director") {
						e.employeeSatisfaction.satSurveyReceived = true;
						console.log(e.employeeName + " has received a survey.")
					}
				}
			}
		}


		if (es.surveySent == true) {
			//if surveys have been sent, check if the responses are back within 3 days. If not, send a reminder.
			if (es.allSurveysReceived == false) {


				let timeSinceSurveysSent = data.date - es.surveySentDate;
				//	console.log("Time since surveys sent: " + timeSinceSurveysSent / dayInMs);
				let daysSinceSurveysSent = 3;

				if (timeSinceSurveysSent >= (daysSinceSurveysSent * dayInMs) && es.reminderSent == false) {
					//console.log("Another reminder sent");
					es.surveyRemindersSentDate = data.date;
					es.reminderSent = true;
				}

			}
		}

		if (es.allSurveysReceived == false) {
			//check if it's been over 2 days since the reminder
			let timeSinceReminderSent = data.date - es.surveyRemindersSentDate;
			let daysSinceReminderSent = 2;

			if (timeSinceReminderSent >= (daysSinceReminderSent * dayInMs)) {
				//if it's been over 2 days, assume all the surveys are back
				es.allSurveysReceived = true;

				for (let u in data.company.Employees) {
					let e = data.company.Employees[u];

					if (e.status == "Active") {
						e.employeeSatisfaction.satSurveyCompleted = true;

						let highSalary = 25000;

						if (e.salary >= highSalary || e.unionMember == true || e.employeeBenefits == true) {
							let score = getRandNum(8, 10);
							e.employeeSatisfaction.workerSatisfactionRating = score;
							//console.log(e.employeeSatisfaction.workerSatisfactionRating);
						} else {
							let score = getRandNum(5, 10);
							e.employeeSatisfaction.workerSatisfactionRating = score;
							//console.log(e.employeeSatisfaction.workerSatisfactionRating);
						}
					}
				}
			}
		}

		//signalling end of step
		console.log("******************************************************************");
	}
}

// function to run simulation and calculations
// also contains code to populate html values
function startSim(stepsval) {

	//track monthly balance
	var fin = data.company.Finances;
	var currentBal = fin.bankBalance.toFixed();
	data.company.monthlyBalance.push(currentBal);

	//track how many steps to run
	var savedStepsValue = stepsval;
	console.log(savedStepsValue);

	//running through the simulation for how many days
	for (let step = 0; step < stepsval; step++) {
		simulate_tick(data);
		simulate_calc(data);
	}

	//working out differences for difference financial card in html page
	var newBalance = data.company.Finances.bankBalance;
	var newProfit = data.company.Finances.Turnover.annualProfit;
	var newLoss = data.company.Finances.Turnover.annualLoss;
	var newIncome = data.company.Finances.Banking.Ingoing.totalProductSaleIncome;
	var newTips = data.company.Finances.Banking.Ingoing.totalTips;

	var balanceChange = percentIncrease(origBalance, newBalance);
	if (origBalance > newBalance) {
		document.getElementById('diffBank').innerHTML = "Bank Balance: &emsp;<b>" + balanceChange + "% decrease";
	} else if (origBalance < newBalance) {
		document.getElementById('diffBank').innerHTML = "Bank Balance: &emsp;<b>" + balanceChange + "% increase";
	} else {
		document.getElementById('diffBank').innerHTML = "Bank Balance: &emsp;<b>" + balanceChange + "%";
	}

	var profitChange = percentIncrease(origProfit, newProfit);
	if (origProfit < newProfit) {
		document.getElementById('diffProf').innerHTML = "Profit: &emsp;<b>+" + profitChange + "%";
	} else {
		document.getElementById('diffProf').innerHTML = "Profit: &emsp;<b>" + profitChange + "%";
	}

	var LossChange = percentIncrease(origLoss, newLoss);
	if (origLoss < newLoss) {
		document.getElementById('diffLoss').innerHTML = "Loss: &emsp;<b>+" + LossChange + "%";
	} else {
		document.getElementById('diffLoss').innerHTML = "Loss: &emsp;<b>" + LossChange + "%";
	}

	var IncomeChange = percentIncrease(origIncome, newIncome);
	if (origIncome < newIncome) {
		document.getElementById('diffInc').innerHTML = "Product Sales: &emsp;<b>+" + IncomeChange + "%";
	} else {
		document.getElementById('diffInc').innerHTML = "Product Sales: &emsp;<b>" + IncomeChange + "%";
	}

	var tipsChange = percentIncrease(origTips, newTips);
	if (origTips < newTips) {
		document.getElementById('diffTips').innerHTML = "Tips: &emsp;<b>+" + tipsChange + "%";
	} else {
		document.getElementById('diffTips').innerHTML = "Tips: &emsp;<b>" + tipsChange + "%";
	}


	//writing new date to html page
	document.getElementById('post-date').innerHTML = "<b>" + data.date.toLocaleDateString('en-GB') + "</b>";

	//writing new values to html page
	document.getElementById('newBank').innerHTML = "Bank Balance: &emsp;<b>£" + data.company.Finances.bankBalance.toLocaleString('en-UK');
	document.getElementById('newProf').innerHTML = "Profit: &emsp;<b>£" + data.company.Finances.Turnover.annualProfit.toLocaleString('en-UK');
	document.getElementById('newLoss').innerHTML = "Loss: &emsp;<b>£" + data.company.Finances.Turnover.annualLoss.toLocaleString('en-UK');
	document.getElementById('newInc').innerHTML = "Product Sales: &emsp;<b>£" + data.company.Finances.Banking.Ingoing.totalProductSaleIncome.toLocaleString('en-UK');
	document.getElementById('newTips').innerHTML = "Tips: &emsp;<b>£" + data.company.Finances.Banking.Ingoing.totalTips.toLocaleString('en-UK');
	document.getElementById('custVisit').innerHTML = "<h2><b><em>" + data.company.customersVisit.toLocaleString('en-UK') + "</em></b></h2>";
	document.getElementById('vendorSales').innerHTML = "<h2><b><em>" + data.company.vendorSales.toLocaleString('en-UK') + "</em></b></h2>";
	document.getElementById('socialPosts').innerHTML = "<h2><b><em>" + data.company.socialPosts.toLocaleString('en-UK') + "</em></b></h2>";

	//calculating number of active employees for UI
	var acEmps = 0;
	for (let b in data.company.Employees) {
		let e = data.company.Employees[b];
		if (e.status == "Active") {
			acEmps += 1;
		}
	}
	document.getElementById('activeEmployees').innerHTML = "<h2><b><em>" + acEmps.toLocaleString('en-UK') + "</em></b></h2>";

	//pushing customer visits for chart volume for current post-simulation month
	var cvisits = data.company.customersVisit;
	data.company.visits.push(cvisits);

	//refreshing charts once simulation has run
	myChart.update();
	myChart2.update();
	myChart3.update();
	myChart4.update();

	//index.html tables updates
	var ds = data.company.Employees;
	var pr = data.company.Products;

	//adding search functionality on updated employee and product data tables
	$('#search-input2').on('keyup', function () {
		var value = $(this).val()
		console.log('Value: ', value);
		var data = searchTable(value, ds);
		//var datapr = searchTable(value, pr);
		buildTable(data);
		//buildTablePr(datapr);
	})

	$('#search-input4').on('keyup', function () {
		var value = $(this).val()
		console.log('Value: ', value);
		//var data = searchTable(value, ds);
		var datapr = searchTablePr(value, pr);
		//buildTable(data);
		buildTablePr(datapr);
	})

	buildTable(data.company.Employees);
	buildTablePr(data.company.Products);

	//rebuilding table whilst user is searching

	function buildTable(datasource) {
		var table = document.getElementById('empTableNew');

		table.innerHTML = ''

		for (var i = 0; i < datasource.length; i++) {
			var emp = datasource[i];
			var row = `<tr>
                    <td>${datasource[i].employeeName}</td>
                    <td>${datasource[i].status}</td>
                    <td>${datasource[i].employeeType}</td>
                    <td>${datasource[i].contract}</td>
                    <td>${datasource[i].workingHours}</td>
                    <td>${datasource[i].leaveTaken}</td>
                    <td>${datasource[i].sickDays}</td>
                    <td>£${datasource[i].salary.toFixed(2)}</td>
                    <td>${datasource[i].productivityRating}</td>
                </tr>`
			table.innerHTML += row
		}

	}

	function buildTablePr(datasource) {
		var table = document.getElementById('prodTableNew');

		table.innerHTML = ''

		for (var i = 0; i < datasource.length; i++) {
			var prod = datasource[i];
			var row = `<tr>
                    <td>${datasource[i].productName}</td>
                    <td>${datasource[i].numInStock}</td>
                    <td>£${datasource[i].discount.toFixed(2)}</td>
                    <td>${datasource[i].volumeMadePerYear}</td>
                    <td>${datasource[i].volumeSoldPerYear}</td>
                    <td>£${datasource[i].totalSale.toFixed(2)}</td>
                </tr>`
			table.innerHTML += row
		}

	}
}



//function to calculate the percentage difference between two values
function percentIncrease(a, b) {
	let percent;
	if (b !== 0) {
		if (a !== 0) {
			percent = (b - a) / a * 100;
		} else {
			percent = b * 100;
		}
	} else {
		percent = - a * 100;
	}
	return Math.floor(percent);
}

//function to add days to a given date
function addDays(date, days) {
	var newDate = new Date(date);
	newDate.setDate(newDate.getDate() + days);
	return newDate;
}


//function determining if a product is likely to be bought
function probOfBuyingProduct(customer, product) {
	let probabilityOfBuying = 0.0;
	//Likely they will buy something if they bought it last time
	if (customer.productsBought.includes(product.productName)) {

		probabilityOfBuying += chanceOfBuyingTheSameThingAsLastTime;
	}
	//They won't buy it if it's more than their budget
	if (customer.customerBudget <= (product.productSalePrice - product.discount)) {

		probabilityOfBuying -= decreasedProbOfPurchaseBudget;
	}
	//more likely to buy if they have a discount or product is discounted
	if (customer.customerDisc > 0.00 || product.discount > 0.00) {

		probabilityOfBuying += chanceOfBuyingDiscount;
	}


	return probabilityOfBuying;
}

//function determining if an employee is due a payrise
function probOfPayrise(employee) {

	let probabilityOfPayrise = 0.0;

	//if they belong to a union, they are more likely to get a payrise
	if (employee.unionMember == true) {
		probabilityOfPayrise += increasedProbPayUnion;
	}

	//if they are full time instead of part time
	if (employee.contract == "FT") {
		probabilityOfPayrise += increasedProbPayFt;
	}

	//if they've been with the company over 2 years
	let timeSinceStartDate = data.date - employee.startDate;
	let timeWithCompany = 2;

	if (timeSinceStartDate >= timeWithCompany * yearInMs) {
		probabilityOfPayrise += increasedProbPayStart;
	}

	//if it's been a year or over 3 years since their last payrise
	let timeSinceLastPayrise = data.date - employee.lastPayriseDate;
	let yearSincePayrise = 1;
	let increasedYearSincePayrise = 3;

	if ((timeSinceLastPayrise >= yearSincePayrise * yearInMs) ||
		(timeSinceLastPayrise >= increasedYearSincePayrise * yearInMs)) {
		probabilityOfPayrise += increasedProbPayYear;
	}

	//if they have a high productivity rating
	let highProductivity = 8;
	if (employee.productivityRating >= highProductivity) {
		probabilityOfPayrise += increasedProbPayProductivityRating;
	}

	return probabilityOfPayrise;

}

//function calculating the probability of an employee being fired
function probOfDismissal(employee) {

	let probabilityOfDismissal = 0.0;

	//if they have a low productivity rating
	let lowProductivity = 5;
	if (employee.productivityRating <= lowProductivity) {
		probabilityOfDismissal += increasedProbDismissalProductivity;
	}

	//if they've taken a lot of sick days off
	let ftSickness = 10;
	let ptSickness = 5;

	if ((employee.contract == "FT" && employee.sickDays >= ftSickness) ||
		(employee.contract == "PT" && employee.sickDays >= ptSickness)) {
		probabilityOfDismissal += increasedProbDismissalSickness;
	}

	return probabilityOfDismissal;

}

//function to search an array for a value
function arrayCheck(i, array) {
	return (array.indexOf(i) > -1);
}

//function to compare two dates based only on month and day, ignoring year and hours
function dayMonthCompare(first, second) {
	first.setHours(0, 0, 0);
	second.setHours(0, 0, 0);
	first.setYear(0);
	second.setYear(0);

	if (first.getDate() == second.getDate() && first.getMonth() == second.getMonth()) {
		return true;
	} else {
		return false;
	}
}

//function determining if two dates are within two days of each other
function dayCompareTwoDayPeriod(first, second) {

	first.setMonth(0),
		second.setMonth(0),
		first.setHours(0, 0, 0);
	second.setHours(0, 0, 0);
	first.setYear(0);
	second.setYear(0);

	if (first.getDate() <= second.getDate() + 2 && first.getDate() >= second.getDate() - 2) {
		return true;
	} else {
		return false;
	}
}

//business owner action - change price of products
function increasePrices(priceIncrease) {
	for (let x in data.company.Products) {
		let p = data.company.Products[x];

		p.productSalePrice = +p.productSalePrice + +priceIncrease;
		console.log("Price increased for " + p.productName);
	}


	//building table for html action modal
	buildTableProducts(data.company.Products);

	function buildTableProducts(datasource) {
		var table = document.getElementById('productsTableNew');

		table.innerHTML = ''

		for (var i = 0; i < datasource.length; i++) {
			var prod = datasource[i];
			var row = `<tr>
                    <td>${datasource[i].productName}</td>
                    <td>${datasource[i].numInStock}</td>
					<td>£${datasource[i].productSalePrice.toFixed(2)}</td>
                </tr>`
			table.innerHTML += row
		}

	}

}

//business owner action - change price of products
function increaseVendorCharge(priceIncrease) {
	for (let x in data.company.Products) {
		let p = data.company.Products[x];

		p.vendorPrice = +p.vendorPrice + +priceIncrease;
		console.log("Vendor price increased for " + p.productName);
	}

	//build table for html action modal
	buildTableProductsVendor(data.company.Products);

	function buildTableProductsVendor(datasource) {
		var table = document.getElementById('productsVendorTableNew');

		table.innerHTML = ''

		for (var i = 0; i < datasource.length; i++) {
			var prod = datasource[i];
			var row = `<tr>
                    <td>${datasource[i].productName}</td>
                    <td>£${datasource[i].productSalePrice.toFixed(2)}</td>
                    <td>£${datasource[i].vendorPrice.toFixed(2)}</td>
                </tr>`
			table.innerHTML += row
		}

	}
}

//business owner action - change staff pay
function changePay(price) {
	for (let y in data.company.Employees) {
		let e = data.company.Employees[y];

		e.salary = +e.salary + +price;
		console.log("Pay changed for " + e.employeeName);
	}

	//built table for action modal in html page
	buildTableEmployees(data.company.Employees);

	function buildTableEmployees(datasource) {
		var table = document.getElementById('employeeTableNew');

		table.innerHTML = ''

		for (var i = 0; i < datasource.length; i++) {
			var emp = datasource[i];
			var row = `<tr>
                    <td>${datasource[i].employeeName}</td>
                    <td>${datasource[i].status}</td>
                    <td>${datasource[i].employeeType}</td>
                    <td>£${datasource[i].salary.toFixed(2)}</td>
                </tr>`
			table.innerHTML += row
		}

	}
}

//business owner action - change visit likelihood
function updateVisitLikelihood(value) {

	likelihoodOfRepeatVisit = +likelihoodOfRepeatVisit + +value;
	increasedProbOfVisitLoyaltyCard = +increasedProbOfVisitLoyaltyCard + +value;
	increasedProbOfVisitLoyaltyVisit = +increasedProbOfVisitLoyaltyVisit + +value;
	increasedProbOfVisitSocialPost = +increasedProbOfVisitSocialPost + +value;
	increasedProbOfVisitPayDay = +increasedProbOfVisitPayDay + +value;
	increasedProbOfVisitBirthday = +increasedProbOfVisitBirthday + +value;
	increasedProbOfVisitSpecialDay = +increasedProbOfVisitSpecialDay + +value;

	//populate html modal
	document.getElementById('likelihoodOfRepeatVisitNEW').innerHTML = "Likelihood of a customer visiting again: <b>" + likelihoodOfRepeatVisit.toFixed(2);
	document.getElementById('increasedProbOfVisitLoyaltyCardNEW').innerHTML = "Likelihood based on customer having a loyalty card: <b>" + increasedProbOfVisitLoyaltyCard.toFixed(2);
	document.getElementById('increasedProbOfVisitLoyaltyVisitNEW').innerHTML = "Likelihood based on high number of Loyalty visits: <b>" + increasedProbOfVisitLoyaltyVisit.toFixed(2);
	document.getElementById('increasedProbOfVisitSocialPostNEW').innerHTML = "Likelihood of a visit after seeing a social media post <b>" + increasedProbOfVisitSocialPost.toFixed(2);
	document.getElementById('increasedProbOfVisitPayDayNEW').innerHTML = "Likelihood of a visit after being paid: <b>" + increasedProbOfVisitPayDay.toFixed(2);
	document.getElementById('increasedProbOfVisitBirthdayNEW').innerHTML = "Likelihood of a visit on their birthday <b>" + increasedProbOfVisitBirthday.toFixed(2);
	document.getElementById('increasedProbOfVisitSpecialDayNEW').innerHTML = "Likelihood of a visit on a holiday <b>" + increasedProbOfVisitSpecialDay.toFixed(2);
}

//business owner action - change purchase likelihood
function updatePurchaseLikelihood(value) {

	chanceOfBuyingTheSameThingAsLastTime = +chanceOfBuyingTheSameThingAsLastTime + +value;
	chanceOfBuyingDiscount = +chanceOfBuyingDiscount + +value;

	document.getElementById('chanceOfBuyingTheSameThingAsLastTimeNEW').innerHTML = "Likelihood of buying the same product as they have before: <b>" + chanceOfBuyingTheSameThingAsLastTime.toFixed(2);
	document.getElementById('chanceOfBuyingDiscountNEW').innerHTML = "Likelihood of buying a product because it's on sale: <b>" + chanceOfBuyingDiscount.toFixed(2);
}


//get field from an object
function getFields(input, field) {
	var output = [];
	for (var i = 0; i < input.length; i++) {
		output.push(input[i][field]);
	} return output;
}

//separate random function generator
function getRandNum(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);

	return Math.floor(Math.random() * (max - min + 1) + min);
}