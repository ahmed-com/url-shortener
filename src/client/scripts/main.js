var globalUrlList = [];
const table = document.getElementById('target');
const urlInput = document.getElementById('url');

async function loadUrls() {
  let response = await fetch(`/api/url`);
  response = await response.json();
  response.data = response.data.sort((a, b) => {
    return b.hits.length - a.hits.length;
  });

  const sessionRows = response.data.reduce((acc, cur, index) => {
    const shortUrl = window.location + cur._id;

    acc += `<tr>
              <td>${index + 1}</td>
              <td>${cur._id}</td>
              <td><a href="${shortUrl}" target="_blank">${shortUrl}</a></td>
              <td>${cur.longUrl}</td>
              <td>${totalHits(cur.hits)}</td>
              <td>${new Date(cur.date).toLocaleDateString('en-US')}</td>
          </tr>`;
    return acc;
  }, '');
  table.innerHTML = sessionRows;
}

function createURL(input) {
  const longUrl = urlInput.value;
  fetch('/api/url/shorten', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      longUrl,
    }),
  })
    .then((res) => res.json())
    .then((res) => {
      location.reload();
    });
  console.log('input', longUrl);
}

function toggleSpinner(elem, defaultContent, on) {
  if (on) {
    elem.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`;
  } else {
    elem.innerHTML = defaultContent;
  }
}

window.onload = function () {
  console.log('ran onload');
  loadUrls().then(() => {
    console.log('ran load options');
  });
};

function totalHits(hits){
  let sum = 0;
  hits.forEach(hit => {
    sum += hit.hitCount;
  });
  return sum;
}