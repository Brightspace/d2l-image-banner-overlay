/**
`d2l-image-banner-overlay`
An overlay for course image banners that displays the course name and menu.
@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import '@polymer/polymer/polymer-legacy.js';

import 'd2l-alert/d2l-alert.js';
import 'd2l-dropdown/d2l-dropdown-menu.js';
import 'd2l-dropdown/d2l-dropdown-more.js';
import 'd2l-fetch/d2l-fetch.js';
import 'd2l-icons/d2l-icon.js';
import 'd2l-icons/d2l-icons.js';
import 'd2l-image-selector/d2l-basic-image-selector.js';
import 'd2l-link/d2l-link.js';
import 'd2l-loading-spinner/d2l-loading-spinner.js';
import 'd2l-menu/d2l-menu.js';
import 'd2l-menu/d2l-menu-item.js';
import 'd2l-organization-hm-behavior/d2l-organization-hm-behavior.js';
import 'd2l-polymer-behaviors/d2l-dom.js';
import 'd2l-polymer-behaviors/d2l-focusable-behavior.js';
import 'd2l-simple-overlay/d2l-simple-overlay.js';
import '@polymer/iron-scroll-threshold/iron-scroll-threshold.js';
import './d2l-image-banner-overlay-styles.js';
import './localize-behavior.js';
import SirenParse from 'siren-parser';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="d2l-image-banner-overlay">
	<template strip-whitespace="">
		<style include="d2l-image-banner-overlay-styles"></style>

		<div id="overlayContent" class="d2l-image-banner-overlay-content d2l-visible-on-ancestor-target">
			<div class="d2l-image-banner-course-name-container">
				<div class="d2l-image-banner-course-name">
					<h1 id="bannerTitle">[[bannerTitle]]</h1>
				</div>
			</div>
			<d2l-dropdown-more class="d2l-focusable" hidden$="[[!_showDropdown]]" text="[[localize('bannerSettings')]]" translucent="" visible-on-ancestor="">
				<d2l-dropdown-menu>
					<d2l-menu label$="[[localize('bannerSettings')]]">
						<d2l-menu-item id="change-image-button" hidden$="[[!_showChangeImageMenuItem]]" text="[[localize('changeImage')]]" on-d2l-menu-item-select="_launchCourseTileImageSelector">
						</d2l-menu-item>
						<d2l-menu-item hidden$="[[!canChangeBannerTitle]]" text="[[localize('customizeBannerText')]]" on-d2l-menu-item-select="_changeBannerTitle">
						</d2l-menu-item>
						<d2l-menu-item id="opt-out-button" hidden$="[[!_showRemoveBannerMenuItem]]" text="[[localize('removeBanner')]]" on-d2l-menu-item-select="_toggleCourseBanner">
						</d2l-menu-item>
					</d2l-menu>
				</d2l-dropdown-menu>
			</d2l-dropdown-more>
			<div class="loading-overlay">
				<d2l-loading-spinner size="100"></d2l-loading-spinner>
				<div class="icon-container">
					<d2l-icon class$="[[_iconDetails.className]]" icon="[[_iconDetails.iconName]]"></d2l-icon>
				</div>
			</div>
		</div>
		<d2l-simple-overlay id="basic-image-selector-overlay" title-name="[[localize('changeImage')]]" close-simple-overlay-alt-text="[[localize('closeSimpleOverlayAltText')]]" with-backdrop="">
			<iron-scroll-threshold id="image-selector-threshold" on-lower-threshold="_onChangeImageLowerThreshold">
			</iron-scroll-threshold>
			<d2l-basic-image-selector image-catalog-location="[[imageCatalogLocation]]" organization="[[_organization]]" course-image-upload-cb="[[courseImageUploadCb]]">
			</d2l-basic-image-selector>
		</d2l-simple-overlay>
		<d2l-alert id="optBackInAlert" hidden$="[[!_showBannerRemovedAlert]]" button-text="[[localize('undo')]]" has-close-button="true" role="alert">
			<span id="bannerRemovedMenuAlertText">[[localize('bannerRemovedMenu')]]</span>
		</d2l-alert>
		<d2l-alert id="errorAlert" hidden$="[[!_showBannerErrorAlert]]" has-close-button="true" role="alert" type="error">
			<span>[[_errorAlertStart]]</span><d2l-link href="javascript:window.location.reload(true)">[[localize('refreshAndTryAgain')]]</d2l-link><span>[[_errorAlertEnd]]</span>
		</d2l-alert>
		<d2l-alert hidden$="[[!_showErrorLoadingBannerImage]]" class="d2l-image-banner-error-alert" type="error">
			<span>[[localize('imageLoadingError')]]</span>
		</d2l-alert>
	</template>

</dom-module>`;

document.head.appendChild($_documentContainer.content);
Polymer({
	is: 'd2l-image-banner-overlay',
	properties: {
		/**
		 * Callback function for d2l-image-selector
		 */
		courseImageUploadCb: Function,
		/**
		 * Url used to request organization information
		 */
		organizationUrl: String,
		/**
		 * URL that is called by the widget to fetch results from the
		 * course image catalog
		 */
		imageCatalogLocation: String,
		/**
		 * Hack: temporarily set z-index to 100 so that iron-overlay can
		 * work (it is set to 999 at body level).
		 */
		imageSelectorOpen: {
			type: Boolean,
			value: false,
			reflectToAttribute: true
		},
		/**
		 * Banner title text to display in the main text area of the overlay
		 */
		bannerTitle: String,
		/**
		 * Whether or not the user can change banner title
		 */
		canChangeBannerTitle: {
			type: Boolean,
			value: false
		},
		/**
		 * Whether or not an error occurred when loading the banner image
		 */
		errorLoadingBannerImage: {
			type: Boolean,
			value: false
		},
		_removeBannerUrl: String, // the URL of the siren action to be executed when the remove banner menu option is clicked
		_addBannerUrl: String, // the URL of the siren action to be executed when the Undo option is clicked on the alert
		_changeImageUrl: String, // the URL of the siren action to be executed to set a course image catalog image for a course
		_organization: Object, // The organization Entity, fetched by the course tile when the `enrollment` Entity is changed
		_showBannerRemovedAlert: Boolean, // indicates if the optBackIn alert should be displayed
		_showBannerErrorAlert: Boolean, // indicates if the "something went wrong alert should be displayed"
		_errorAlertStart: String, // the first portion of the localized text to display in the alert when something went wrong with removing the banner
		_errorAlertEnd: String, // the last portion of the localized text to display in the alert when something went wrong with removing the banner
		// The icon we want to show when you select an image
		_iconDetails: {
			type: Object,
			value: {
				className: '',
				iconName: ''
			}
		},
		_shouldRefreshCourseImage: Boolean, // whether or not to refresh course image after getting org info
		_nextImage: Object, // when changing the banner image, the next image to show
		_showDropdown: {
			type: Boolean,
			value: false,
			computed: '_computeShowDropdown(_showRemoveBannerMenuItem, _showChangeImageMenuItem)'
		},
		_showChangeImageMenuItem: {
			type: Boolean,
			value: false,
			computed: '_computeShowMenuItem(_changeImageUrl)'
		},
		_showRemoveBannerMenuItem: {
			type: Boolean,
			value: false,
			computed: '_computeShowMenuItem(_removeBannerUrl)'
		},
		_showErrorLoadingBannerImage: {
			type: Boolean,
			value: false,
			computed: '_computeShowErrorLoadingBannerImage(errorLoadingBannerImage, _showBannerErrorAlert, _showBannerRemovedAlert)'
		}
	},
	behaviors: [
		D2L.PolymerBehaviors.ImageBanner.LocalizeBehavior,
		D2L.PolymerBehaviors.Hypermedia.OrganizationHMBehavior,
		D2L.PolymerBehaviors.FocusableBehavior
	],
	listeners: {
		'd2l-alert-button-pressed': '_onAlertButtonPressed',
		'd2l-alert-closed': '_onAlertClosed',
		'clear-image-scroll-threshold': '_onClearImageScrollThreshold',
		'd2l-simple-overlay-closed': '_onSimpleOverlayClosed',
		'blur': '_onBlur'
	},
	attached: function() {
		afterNextRender(this, function() {
			this.addEventListener('blur', this._onBlur, true);
		}.bind(this));
		this.$['image-selector-threshold'].scrollTarget = this.$['basic-image-selector-overlay'].scrollRegion;
		if (this.organizationUrl) {
			this._getOrganizationInfo();
		}
		this.listen(document.body, 'set-course-image', '_onSetCourseImage');
	},
	detached: function() {
		this.removeEventListener('blur', this._onBlur, true);
		this.unlisten(document.body, 'set-course-image', '_onSetCourseImage');
	},
	ready: function() {
		this._addPerfMark('ready');
		this._showBannerRemovedAlert = false;
		this._showBannerErrorAlert = false;
		dom(this.$.overlayContent).classList.add('d2l-image-banner-overlay-content-shown');

	},
	courseImageUploadCompleted: function(success) {
		var overlayContent = this.$.overlayContent;

		if (success) {
			this.$['basic-image-selector-overlay'].close();
			this.toggleClass('change-image-loading', true, overlayContent);
			this._shouldRefreshCourseImage = true;
			this._getOrganizationInfo();
		} else {
			this._displaySetImageResult(false);
		}
		this.focus();
	},
	_getOrganizationInfo: function() {

		var headerOptions = new Headers({
			Accept: 'application/vnd.siren+json'
		});

		if (this._organization) {
			headerOptions.append('cache-control', 'no-cache');
		}

		return window.d2lfetch
			.fetch(new Request(this.organizationUrl, {
				headers: headerOptions
			}))
			.then(function(response) {
				if (response.ok) {
					return response.json();
				}
				return Promise.reject(response.status + response.statusText);
			})
			.then(this._onOrganizationResponse.bind(this))
			.catch(this._onFetchError.bind(this));
	},
	_onChangeImageLowerThreshold: function() {
		this.$$('d2l-basic-image-selector').loadMore(this.$['image-selector-threshold']);
	},
	_onClearImageScrollThreshold: function() {
		this.$['image-selector-threshold'].clearTriggers();
	},
	_onSetCourseImage: function(e) {
		this.$['basic-image-selector-overlay'].close();

		var org = this._parseSiren(e.detail.organization);
		var orgSelfLink = (org.getLinkByRel('self') || {}).href || '';

		if (orgSelfLink !== this.organizationUrl) {
			return;
		}

		switch (e.detail.status) {
			case 'set':
				if (!e.detail.image) {
					break;
				}
				var newImageHref = this._getDefaultImageLink(e.detail.image);
				var overlayContent = this.$.overlayContent;
				this.toggleClass('change-image-loading', true, overlayContent);
				// load the image while the loading spinner runs to that we have it when the spinner ends
				// NOTE: if this needs optimization, we can wait for the image's onload to play the success animation
				this._nextImage = e.detail.image;
				var imagePreloader = document.createElement('img');
				imagePreloader.setAttribute('src', newImageHref);
				break;
			case 'success':
				this._displaySetImageResult(true);
				break;
			case 'failure':
				this._displaySetImageResult(false);
				break;
		}
	},
	_onSimpleOverlayClosed: function() {
		this.imageSelectorOpen = false;
	},
	_displaySetImageResult: function(success, forceImgRefresh) {
		var overlayContent = this.$.overlayContent,
			successClass = 'change-image-success',
			failureClass = 'change-image-failure';

		// We want to wait at least a second of the load icon before showing the status
		setTimeout(function() {
			this.toggleClass('change-image-loading', false, overlayContent);
			this.toggleClass(successClass, success, overlayContent);
			this.toggleClass(failureClass, !success, overlayContent);
			this._iconDetails = success ?
				{ className: 'checkmark', iconName: 'd2l-tier2:check'} :
				{ className: 'fail-icon', iconName: 'd2l-tier3:close'};

			// Remove the icon after a bit of time
			setTimeout(function() {
				if (success) {
					this._setBannerImage(this._nextImage, forceImgRefresh);
				}
				this.toggleClass(successClass, false, overlayContent);
				this.toggleClass(failureClass, false, overlayContent);
			}.bind(this), 1000);
		}.bind(this), 1000);
	},
	_launchCourseTileImageSelector: function() {
		this.imageSelectorOpen = true;
		this.$['basic-image-selector-overlay'].open();
	},
	_setBannerImage: function(image, forceImgRefresh) {
		var bannerImage = document.querySelector('.d2l-course-banner .d2l-course-banner-image');
		var imageSrc = this._getDefaultImageLink(image);

		if (forceImgRefresh) {
			var separator = imageSrc.split('?')[1] ? '&' : '?';
			imageSrc = imageSrc + separator + 'timestamp=' + new Date().getTime();
		}

		if (bannerImage && imageSrc) {
			bannerImage.srcset = '';
			bannerImage.src = imageSrc;
		}
	},
	_getDefaultImageLink: function(image) {
		return this.getDefaultImageLink(image, 'wide');
	},
	_parseSiren: function(entity) {
		return SirenParse(entity);
	},
	_computeShowDropdown: function(showRemove, showChange) {
		return showRemove || showChange;
	},
	_computeShowMenuItem: function(url) {
		return !!url;
	},
	_computeShowErrorLoadingBannerImage: function(errorLoadingBannerImage,  showBannerErrorAlert, showBannerRemovedAlert) {
		return errorLoadingBannerImage && !showBannerErrorAlert && !showBannerRemovedAlert;
	},
	_onCourseImageResponse: function(courseImage) {
		this._nextImage = this._parseSiren(courseImage);
		this._displaySetImageResult(true, true);
	},
	_onOrganizationResponse: function(organization) {
		var organizationEntity = this._parseSiren(organization);

		this._organization = organizationEntity;

		this._addPerfMark('org-response.parsed');
		this._addPerfMeasure('ready-to-org-response-parsed', 'ready', 'org-response.parsed');

		this._removeBannerUrl = (organizationEntity.getActionByName('remove-homepage-banner') || {}).href;
		this._changeImageUrl = (organizationEntity.getActionByName('set-catalog-image') || {}).href;
		if (this._removeBannerUrl || this._changeImageUrl || this.canChangeBannerTitle) {
			dom(this.$.bannerTitle).classList.add('menu-exists');
		}

		var self = this;
		afterNextRender(this, function() {
			self._addPerfMark('org-response.rendered');
			self._addPerfMeasure('ready-to-org-response-displayed', 'ready', 'org-response.rendered');
		});

		if (this._shouldRefreshCourseImage) {
			this._refreshCourseImage(organizationEntity.getSubEntityByClass('course-image').href);
		}
	},
	_refreshCourseImage: function(courseImageApiUrl) {
		window.d2lfetch
			.fetch(new Request(courseImageApiUrl, {
				headers: new Headers({
					Accept: 'application/vnd.siren+json'
				})
			}))
			.then(function(response) {
				if (response.ok) {
					return response.json();
				} else {
					this._displaySetImageResult(false);
				}
			}.bind(this))
			.then(this._onCourseImageResponse.bind(this));
	},
	_toggleCourseBanner: function() {
		var url = this._addBannerUrl || this._removeBannerUrl;
		dom(this.$.overlayContent).classList.add('loading-overlay-shown');

		if (!url) {
			return;
		}

		this.dispatchEvent(new CustomEvent(
			'd2l-image-banner-overlay-toggle-banner',
			{bubbles: true, composed: true}
		));

		return window.d2lfetch
			.fetch(new Request(url, {
				method: 'PUT',
				headers: new Headers({
					Accept: 'application/vnd.siren+json',
					'Content-Type': 'application/x-www-form-urlencoded'
				}),
				body: 'showCourseBanner=' + (url === this._addBannerUrl)
			}))
			.then(function(response) {
				if (response.ok) {
					return response.json();
				}
				return Promise.reject(response.status + response.statusText);
			})
			.then(this._onToggleBannerResponse.bind(this))
			.catch(this._onFetchError.bind(this));
	},
	_changeBannerTitle: function() {
		this.dispatchEvent(new CustomEvent(
			'd2l-image-banner-overlay-change-banner-title',
			{bubbles: true, composed: true}
		));
	},
	_onToggleBannerResponse: function(organization) {
		var organizationEntity = this._parseSiren(organization) || {};
		this._addBannerUrl = (organizationEntity.getActionByName('add-homepage-banner') || {}).href;
		this._removeBannerUrl = (organizationEntity.getActionByName('remove-homepage-banner') || {}).href;

		this._showBannerRemovedAlert = !!this._addBannerUrl;
		if (this._addBannerUrl) {
			this._showAlert(true);
		} else if (this._removeBannerUrl) {
			this._showAlert(false);
		}
	},
	_onFetchError: function() {
		this._showBannerErrorAlert = true;
		this._removeBannerUrl = null;
		var placeholder = 'REFRESH_PAGE';
		var splitText = this.localize('somethingWentWrong', 'placeholder', placeholder).split(placeholder);
		this._errorAlertStart = splitText[0];
		this._errorAlertEnd = splitText[1];
		this._showAlert(true);
	},
	_showAlert: function(show) {
		dom(this.$.overlayContent).classList.remove('loading-overlay-shown');

		// This is a very leaky abstraction. The fact that this element
		// knows to add a CSS class to some arbitrary other element with
		// a CSS class on it isn't great.
		// Ideally, it would fire an event, and the other component
		// would be listening for it and respond accordingly.
		var container = D2L.Dom.findComposedAncestor(this.root, function(p) {
			if (p.classList) {
				return p.classList.contains('d2l-course-banner-container');
			}
			return false;
		});
		if (show) {
			dom(this.$.overlayContent).classList.remove('d2l-image-banner-overlay-content-shown');
			if (container) {
				container.classList.add('showing-alert');
			}
		} else {
			dom(this.$.overlayContent).classList.add('d2l-image-banner-overlay-content-shown');
			if (container) {
				container.classList.remove('showing-alert');
			}
		}
	},
	_onAlertButtonPressed: function(e) {
		var normalizedEvent = dom(e);
		if (normalizedEvent.rootTarget === this.$$('d2l-alert')) {
			this._toggleCourseBanner();
		}
	},
	_onAlertClosed: function(e) {
		var normalizedEvent = dom(e);
		var alert = this.$$('#' + normalizedEvent.rootTarget.id);
		if (normalizedEvent.rootTarget === alert) {
			alert.hidden = true;
		}
	},
	_addPerfMark: function(name) {
		if (window.performance && window.performance.mark) {
			window.performance.mark('d2l.image-banner-overlay.' + name);
		}
	},
	_addPerfMeasure: function(name, startName, endName) {
		if (window.performance && window.performance.measure) {
			window.performance.measure(
				'd2l.image-banner-overlay.' + name,
				'd2l.image-banner-overlay.' + startName,
				'd2l.image-banner-overlay.' + endName
			);
		}
	},
	_onBlur: function() {
		setTimeout(function() {
			if (!D2L.Dom.isComposedAncestor(this, D2L.Dom.Focus.getComposedActiveElement())) {
				this._closeDropdown();
			}
		}.bind(this), 0);
	},
	_closeDropdown: function() {
		if (this.$$('d2l-dropdown-menu').hasAttribute('opened')) this.$$('d2l-dropdown-more').toggleOpen();
	}
});
