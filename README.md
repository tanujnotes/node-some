# ivm-coding-challenge
This repo is a solution built using node.js to the challenge mentioned here: https://github.com/williamivm/backend-coding-challenge

This is my first node.js project so suggestions and corrections are most welcome.

### Problem statement
Search city names in a text file with formatted data. If user location is provided, use that to show more relevant search results. Asign a confidence score to each of your results and sort the results by that score.

Read the full problem statment in the link above.

### Solution
1. For query string supplied, check if the city names contain the query string and if they do, calculate the ratio of the length of query string and city name. Also calculate the inde of query string in city name and use the formula 1 - (index/city_name_length) to get another ratio.
The average of the 2 ratio is the confidence score when only query string is supplied.

2. If you also have the location of the user, calculate the distance between the city and the user location using haversine formula. Use the formula 1 - (distance / (A + distance)) to get the confidence score based on distance. A is a constant. Lower the value of A in `ivm.js` to give higher score to the nearer locations.

Take the average of the values you found in 1 and 2 to get the final confidence score on each of your search results.

### Authors

* Tanuj M. (https://twitter.com/thetanuj)

### License

This project is licensed under the MIT License.

### Instructions

This project is temporarily live. See below the examples of some sample requests:

http://ec2-13-234-30-4.ap-south-1.compute.amazonaws.com/suggestions?q=new%20york

http://ec2-13-234-30-4.ap-south-1.compute.amazonaws.com/suggestions?q=Londo&latitude=43.70011&longitude=-79.4163

**Parameters:** *q*(string, mandatory), *latitude*(float, optional), *longitude*(float, optional)

**Note:** Please don't compare the results you get here and the sample result presented in the problem statement repo. Those results are for representation purpose only. Thank you.
