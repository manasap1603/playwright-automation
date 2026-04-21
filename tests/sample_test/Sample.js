const name = "Manasa";
console.log(name);

let count = 100;
count = count + 1;
console.log(count*2);

// FUNCTION//

function addition(a,b){
    let sum = a+b;
    console.log(sum);
}
addition(10,90);

//CODE TO chcek given num is even using function//

function isEven(num){
    if (num % 2 === 0){
        console.log(num + " " + "is even number");
    }
    else{
        console.log(num+" "+"is not even num");
    }   
}
isEven(306.8);

// same code to chcek given num is even using function and return//

function isEven(num){
    return num%2===0;
}
if (isEven(9)){
    console.log("Even");
}
else{
    console.log("Odd");
}

// code to chec num is +ve or -ve//

function isPositive(num){
    return num>=0;
}
if(isPositive(8)){
    console.log("Positive");
}
else{
    console.log("Negative");
}

//code to return largest num //

function largestNumber(a,b,c){
    let max = a;
    if(b>max){
        max = b;
    }
    if(c>max){
        max = c;
    }
    return max;
}
console.log(largestNumber(23,78,3));
