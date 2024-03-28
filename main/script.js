function submitForm(event) {
  event.preventDefault(); // Prevent the default form submission behavior

  var form = document.getElementById("memberForm");
  var name = form.elements["name"].value;
  var mobileNumber = form.elements["mobileNumber"].value;
  var nidNumber = form.elements["nidNumber"].value;

  var url = "https://de6d2725-7ad5-444f-b2e7-4238caf35f89-00-cl6j06mds3a4.sisko.replit.dev/members/add";
  url += "?name=" + encodeURIComponent(name);
  url += "&mobileNumber=" + encodeURIComponent(mobileNumber);
  url += "&nidNumber=" + encodeURIComponent(nidNumber);

  fetch(url)
    .then(response => response.json())
    .then(data => {
      document.getElementById("apiResponse").innerText = JSON.stringify(data, null, 2);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}
