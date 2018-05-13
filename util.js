
// helps to give a consitent length to string columns
let columnize = function(aString, aLength = 20, isPreString = false) {
    if(aString.length > aLength) return aString.substring(0, aLength -1);
    diff = parseInt(((aLength - aString.length -1)/2)+aString.length);
    let returnString = JSON.parse(JSON.stringify(aString));
    for (let i = aString.length; i < aLength -1; i++) {
            if(i === (aLength - 2)) {
                returnString += "|";
            }else {
                 returnString += " ";
            }
           
    }
    return returnString;
};


// Centers text within a desired width, prepending and appending the character(s) you choose
let centerize = function(aStringToCenter, aPaddingString = "/", aDesiredWidth = 100) {
    if(aStringToCenter.length > aDesiredWidth) return aStringToCenter.substring(0, aDesiredWidth -1);

    let filler = (parseInt(((aDesiredWidth - aStringToCenter.length/2)/2))-2);
    let insert = `\n${aPaddingString.repeat(parseInt(filler / aPaddingString.length))}  `;
    let append = `  ${aPaddingString.repeat(parseInt(filler / aPaddingString.length))}` ; 
    return insert + aStringToCenter + append;
};

module.exports = {
    columnize,
    centerize
};

