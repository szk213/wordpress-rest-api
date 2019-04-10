const axios = require("axios");
const fs = require("fs");

const instance = axios.create({
  baseURL: "https://seihan.gallery/wp-json/wp/v2",
  timeout: 10000
});

async function get(page) {
  let resp;

  let url = `/media?page=${page}&per_page=100&after=2019-01-01T00:00:00`;

  try {
    resp = await instance.get(url);
  } catch (e) {
    // console.log(e.response);
    // console.log(e.response.status);
    if (
      e.response &&
      e.response.status === 400 &&
      e.response.data &&
      e.response.data.code === "rest_post_invalid_page_number"
    ) {
      console.log("kita");
      return Promise.resolve([]);
    }
    throw e;
  }
  console.log(`page: ${page},size: ${resp.data.length}`);
  const nextResp = await get(page + 1);
  return resp.data.concat(nextResp);
}

get(1).then(dataList => {
  const writer = fs.createWriteStream("./out.csv");
  let idList = {};
  dataList.forEach(data => {
    const category = data.title.rendered.split("_")[0];

    if (!idList[category]) {
      idList[category] = [];
    }

    idList[category].push(data.id);

    // if (previousCategory != category) {
    //   writer.write(`category:${category}\n`);
    //   writer.write(
    //     `[gallery ids="${ids.join(",")}" order="ASC" orderby="ID"]\n`
    //   );
    //   // [gallery ids="11669,11668,11667,11666,11665,11664,11663" order="ASC" orderby="ID"]
    //   ids = [];
    // }
    // writer.write(`${data.id},${data.title.rendered}\n`);
    // previousCategory = category;
  });

  //   idList.
  Object.entries(idList).forEach(([key, value]) => {
    console.log({ key, value });
    writer.write(`category:${key}\n`);
    writer.write(
      `[gallery ids="${value.join(",")}" order="ASC" orderby="ID"]\n`
    );
  });
  //   for (const [key, value] of idList) {
  //     writer.write(`category:${key}\n`);
  //     writer.write(
  //       `[gallery ids="${value.join(",")}" order="ASC" orderby="ID"]\n`
  //     );
  //   }
});

// // Make a request for a user with a given ID
// instance
//   .get("/media?page=1&per_page=100")
//   .then(function(response) {
//     response.data;
//     // handle success
//     console.log(response);
//   })
//   .catch(function(error) {
//     // handle error
//     console.log(error);
//   })
//   .then(function() {
//     // always executed
//   });
