module.exports = function (v) {
   const e = [];
   let n, x;
   for (m in v) {
      //min max
      n = v[m][3] || 1;
      x = v[m][4] || 200;

      //text
      if (v[m][1] === "arabicEnglishText")
         new RegExp("^[\\u0621-\\u064Aa-zA-Z\\d\\-_\\s]{" + n + "," + x + "}").test(v[m][0]) ||
            e.push(v[m][2]);

      if (v[m][1] === "text")
         new RegExp("^[a-zA-Z]{" + n + "," + x + "}$").test(v[m][0]) || e.push(v[m][2]);
      // boolean
      if (v[m][1] === "boolean") typeof v[m][0] == "boolean" || e.push(v[m][2]);

      //username
      if (v[m][1] === "username")
         new RegExp("^([a-z]{" + n + "," + x + "})([_])([a-z]{" + n + "," + x + "})$").test(
            v[m][0]
         ) || e.push(v[m][2]);

      //password
      if (v[m][1] === "password")
         new RegExp("^[\\w@-]{" + n + "," + x + "}$").test(v[m][0]) || e.push(v[m][2]);

      //email
      if (v[m][1] === "email")
         new RegExp(
            /^(([^<>(){}[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
         ).test(v[m][0]) || e.push(v[m][2]);

      //phone number
      if (v[m][1] === "phone") new RegExp(/^[0][9][\d]{8}$/).test(v[m][0]) || e.push(v[m][2]);

      // number
      if (v[m][1] === "number")
         (new RegExp(/^[\d]{1,}$/).test(v[m][0]) && Number(v[m][0]) >= n && Number(v[m][0]) <= x) ||
            e.push(v[m][2]);

      // object id
      if (v[m][1] === "id") new RegExp(/^[0-9a-fA-F]{24}$/).test(v[m][0]) || e.push(v[m][2]);
      if (v[m][1] === "hexcolor") new RegExp(/^[0-9a-fA-F]{6}$/).test(v[m][0]) || e.push(v[m][2]);
   }
   return e;
};
// console.log(this.validate({ g: ["112345679065574883030833", "id", "sdf"] }));
