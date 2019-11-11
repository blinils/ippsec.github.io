var searchResultFormat = '<tr><td><a href="$link1">$episode</a></td><td>$description</td><td><a href="$link2">$site</a></td></tr>';
var linkVideo = 'https://youtube.com/watch?v=$idVideo';
var linkTemplate = 'https://youtube.com/watch?v=$extVideo&t=$time';
var subtitleTemplate = 'https://nilsbrisset.info/subtitles/$extVideo.srt';

var controls = {
	oldColor: '',
	displayResults: function(){
		$results.show();
		$resultsTableHideable.removeClass('hide');
	},
	hideResults: function(){
		$results.hide();
		$resultsTableHideable.addClass('hide');
	},
	doSearch: function(match, dataset){
		results = [];

		words = match.toLowerCase();
		words = words.split(" ");
		regex = "";
		// Lazy way to create regex (?=.*word1)(?=.*word2) this matches all words.
		for (i = 0; i < words.length; i++) {
			regex += '(?=.*' + words[i] + ')';
		};

		dataset.forEach((e) => {
			if (e.description.toLowerCase().match(regex) || e.episode.toLowerCase().match(regex)) results.push(e);
		});
		return results;
	},
	updateResults: function($loc, results){
		if (results.length == 0) {
			$noResults.show();
			$noResults.text('Aucun résultat trouvé');
			$resultsTableHideable.addClass('hide');
		}
		else if (results.length > 500) {
			$noResults.show();
			$resultsTableHideable.addClass('hide');
			$noResults.text('Erreur : ' + results.length + ' résultats ont été trouvés, précisez votre demande');
			this.setColor($colorUpdate, 'too-many-results');
		}
		else {
			$loc.empty();
			$noResults.hide();
			$resultsTableHideable.removeClass('hide');

			results.forEach((r) => {
				//Not the fastest but it makes for easier to read code :>
				if(r.site === "sub") { tolink = subtitleTemplate; }
				else if(r.site === "YouTube") { tolink = linkTemplate; }
				else { tolink = linkTemplate; }
				
				timeInSeconds = r.timestamp.minutes * 60 + r.timestamp.seconds;
				el = searchResultFormat
					.replace('$episode', r.episode).replace('$site', r.site)
					.replace('$link1', linkVideo.replace('$idVideo', r.videoId))
					.replace('$description', r.description)
					.replace('$link2', tolink.replace('$extVideo', r.externalId).replace('$time', timeInSeconds));

				$loc.append(el);
			});
		}
	},
	setColor: function($loc, indicator){
		if (this.oldColor == indicator) return;
		var colorTestRegex = /^color-/i;

		$loc[0].classList.forEach((cls) => {
			//we cant use class so we use cls instead :>
			if (cls.match(colorTestRegex)) $loc.removeClass(cls);
		});
		$loc.addClass('color-' + indicator);
		if (this.oldColor != '') {
			var fc = 'color-fade-from-' + this.oldColor + '-to-' + indicator;
			$loc.addClass(fc);
		}
		this.oldColor = indicator;
	}
};
window.controls = controls;

$(document).ready(() => {
	$results = $('div.results');
	$query = $('.query');
	$searchValue = $('input.search').first();
	$form = $('form.searchForm');
	$resultsTableHideable = $('.results-table');
	$resultsTable = $('tbody.results').first();
	$noResults = $('div.noResults');
	$colorUpdate = $('body');

	controls.setColor($colorUpdate, 'no-search');
	controls.hideResults();
	var currentSet = [];
	var oldSearchValue = '';

	function doSearch(event){
		var val = $searchValue.val();

		if (val != '') {
			controls.displayResults();
			if (val.length < oldSearchValue.length) currentSet = window.dataset;
			oldSearchValue = val;

			currentSet = window.controls.doSearch(val, currentSet);
			if (currentSet.length < 500)
				window.controls.setColor($colorUpdate, currentSet.length == 0 ? 'no-results' : 'results-found');

			window.controls.updateResults($resultsTable, currentSet);
		}
		else {
			controls.hideResults();
			window.controls.setColor($colorUpdate, 'no-search');
		}

		if (event.type == 'submit') event.preventDefault();
	}

	$.getJSON('./dataset.json', (data) => {
		window.dataset = data;
		currentSet = window.dataset;
		window.controls.updateResults($resultsTable, window.dataset);
		doSearch({ type: 'none' });
	});

	$form.submit(doSearch);

	$searchValue.on('input', doSearch);
});