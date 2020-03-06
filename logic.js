var searchResultFormat = '<tr><td><a href="$link1">$episode</a></td><td>$description</td><td><a href="$link2">$site</a></td></tr>';
var linkVideo = 'https://youtube.com/watch?v=$idVideo';
var linkTemplate = 'https://youtube.com/watch?v=$extVideo&t=$minsm$secss';
var subtitleTemplate = 'https://nilsbrisset.info/subtitles/$extVideo.srt';
var audio = document.querySelector('audio'); audio.volume = 0.5;

var controls = {

	displayResults: function()
	{
		if (results.style)
		{
			results.style.display = '';
		}

		resultsTableHideable.classList.remove('hide');
	},

	hideResults: function()
	{
		if (results.style)
		{
			results.style.display = 'none';
		}

		resultsTableHideable.classList.add('hide');
	},

	doSearch: function(match, dataset)
	{
		results = [];
		words = match.toLowerCase();
		words = words.split(" ");
		regex = "";

		for (i = 0; i < words.length; i++)
		{
			regex += '(?=.*' + words[i] + ')';
		};

		rainbow = document.querySelector('[id^="fucking"]');
		if (words.includes(atob("cGF0cmljaw==")))
		{
			audio.play();
			rainbow.id = 'fucking-rainbow';
		}
		else
		{
			audio.pause();
			rainbow.id = 'fucking-rainbows';
		};

		dataset.forEach((e) =>
		{
			allthedata = e.description + " " + e.episode + " "
			allthedata += e.videoId + " " + e.externalId + " "
			if (allthedata.toLowerCase().match(regex)) results.push(e);
		});

		return results;
	},

	updateResults: function(loc, results)
	{
		if (results.length == 0)
		{
			noResults.style.display = '';
			noResults.textContent = 'Aucun résultat trouvé';
			resultsTableHideable.classList.add('hide');
		}

		else if (results.length > 500)
		{
			noResults.style.display = '';
			resultsTableHideable.classList.add('hide');
			noResults.textContent = 'Erreur : ' + results.length + ' résultats ont été trouvés, précisez votre demande';
		}

		else
		{
			var tableRows = loc.getElementsByTagName('tr');
			for (var x = tableRows.length - 1; x >= 0; x--)
			{
				loc.removeChild(tableRows[x]);
			}

			noResults.style.display = 'none';
			resultsTableHideable.classList.remove('hide');
			results.forEach((r) =>
			{
				if (r.site === "sub")
				{
					tolink = subtitleTemplate;
				}

				else if (r.site === "YouTube")
				{
					tolink = linkTemplate;
				}

				else
				{
					tolink = linkTemplate;
				}

				timeMins = r.timestamp.minutes
				timeSecs = r.timestamp.seconds;
				el = searchResultFormat
					.replace('$episode', r.episode).replace('$site', r.site)
					.replace('$link1', linkVideo.replace('$idVideo', r.videoId))
					.replace('$description', r.description)
					.replace('$link2', tolink.replace('$extVideo', r.externalId).replace('$mins', timeMins).replace('$secs', timeSecs));
				var wrapper = document.createElement('table');
				wrapper.innerHTML = el;
				var div = wrapper.querySelector('tr');
				loc.appendChild(div);
			});
		}
	},
};

window.controls = controls;
document.addEventListener('DOMContentLoaded', function()
{
	results = document.querySelector('div.results');
	searchValue = document.querySelector('input.search');
	form = document.querySelector('form.searchForm');
	resultsTableHideable = document.getElementsByClassName('results-table').item(0);
	resultsTable = document.querySelector('tbody.results');
	noResults = document.querySelector('div.noResults');
	controls.hideResults();
	var currentSet = [];
	var oldSearchValue = '';

	function doSearch(event)
	{
		var val = searchValue.value;
		if (val != '')
		{
			controls.displayResults();
			if (val.length < oldSearchValue.length) currentSet = window.dataset;
			oldSearchValue = val;
			currentSet = window.controls.doSearch(val, currentSet);
			window.controls.updateResults(resultsTable, currentSet);
		}

		else
		{
			controls.hideResults();
			noResults.style.display = 'none';
			currentSet = window.dataset;
		}

		if (event.type == 'submit') event.preventDefault();
	}
	
	fetch('./dataset.json')
		.then(res => res.json())
		.then(data =>
		{
			window.dataset = data;
			currentSet = window.dataset;
			window.controls.updateResults(resultsTable, window.dataset);
			doSearch({ type: 'none'	});
		});

	form.submit(doSearch);
	searchValue.addEventListener('input', doSearch);
});