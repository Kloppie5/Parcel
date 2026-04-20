const payload = {
  method: "PUT",
  url: "https://localhost:5001/userfile",
  headers: {},
  requestBody: JSON.stringify({})
};

const response = await fetch("http://localhost:3000/request", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(payload)
});

const data = await response.json();

console.log("Response from server:");
console.log(data);