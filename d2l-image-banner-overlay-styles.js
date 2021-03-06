import 'd2l-colors/d2l-colors.js';
import 'd2l-typography/d2l-typography-shared-styles.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="d2l-image-banner-overlay-styles">
	<template strip-whitespace="">
		<style>
			:host {
				height: 100%;
				left: 0;
				word-wrap: break-word; /* IE/Edge */
				overflow-wrap: break-word; /* replaces 'word-wrap' in Firefox, Chrome, Safari */
				position: absolute;
				top: 0;
				width: 100%;
				z-index: 1;
				@apply --d2l-body-standard-text;
			}
			:host([image-selector-open]) {
				z-index: auto;
			}

			.d2l-image-banner-overlay-content {
				display: none;
				height: 100%;
				opacity: 0;
				overflow: hidden;
				width: 100%;
			}

			.d2l-image-banner-overlay-content-shown {
				animation-duration: 1.2s;
				animation-fill-mode: forwards;
				animation-name: shown;
				display: block;
			}

			@keyframes shown {
				0% { opacity: 0 }
				100% { opacity: 1; }
			}

			.d2l-image-banner-course-name {
				background: linear-gradient(rgba(0,0,0,0), #000 120%);
				bottom: 0;
				max-height: 100%;
				padding-top: 3.5rem;
				position: absolute;
				transform: scale3d(1,1,1);
				width: 100%;
			}

			@supports (-webkit-line-clamp: 2) {
				.d2l-image-banner-course-name {
					background: linear-gradient(rgba(0, 0, 0, 0), #000 267px);
					padding-top: 3.35rem;
				}
			}

			#bannerTitle {
				box-sizing: border-box;
				color: var(--d2l-color-white);
				-webkit-line-clamp: 2;
				-webkit-box-orient: vertical;
				display: -webkit-box;
				margin-top: 0;
				overflow: hidden;
				padding-top: 0;
				padding-bottom: 0;
				pointer-events: none;
				@apply --d2l-heading-1;
			}

			d2l-dropdown-more,
			#bannerTitle {
				margin-left: 2.439%;
				margin-right: 2.439%;
			}

			:host([department-banner-flag]) d2l-dropdown-more {
				margin-left: 10px;
				margin-right: 10px;
				margin-top: 10px;
			}

			.loading-overlay-shown d2l-dropdown-more {
				display: none;
			}

			@media (min-width: 1230px) {
				:host(:not([department-banner-flag])) d2l-dropdown-more {
					margin-left: 30px;
					margin-right: 30px;
					margin-top: 30px;
				}

				:host(:dir(rtl)) #bannerTitle.menu-exists {
					padding-left: 50px;
					padding-right: 0;
				}

				#bannerTitle.menu-exists {
					padding-right: 50px;
				}
			}

			@media (max-width: 615px) {
				:host(:not([department-banner-flag])) d2l-dropdown-more {
					margin-left: 15px;
					margin-right: 15px;
					margin-top: 15px;
				}
				#bannerTitle {
					margin-left: 15px;
					margin-right: 15px;
				}
			}

			d2l-dropdown-more {
				position: absolute;
				right: 0;
			}
			d2l-dropdown-more[hidden] {
				display: none;
			}
			:host(:dir(rtl)) d2l-dropdown-more {
				left: 0;
				right: auto;
			}

			:host(:dir(rtl)) #bannerTitle.menu-exists {
				padding-left: 40px;
				padding-right: 0;
			}

			#bannerTitle.menu-exists {
				padding-right: 40px;
			}

			.d2l-image-banner-course-name-container {
				height: 100%;
				overflow: hidden;
				pointer-events: none;
				position: absolute;
				width: 100%;
			}

			d2l-alert {
				font-size: 1rem;
			}

			.d2l-image-banner-error-alert {
				margin-left: 2%;
				margin-right: 2%;
				position: absolute;
				top: 20px;
				width: 95%;
			}

			.loading-overlay {
				align-items: center;
				display: flex;
				height: 100%;
				justify-content: center;
				left: 0;
				opacity: 0;
				pointer-events: none;
				position: absolute;
				top: 0;
				width: 100%;
			}

			.loading-overlay-shown .loading-overlay {
				background-color: rgba(0, 0, 0, 0.4);
				opacity: 1;
				transition: opacity 0.5s 0.5s;
			}

			d2l-loading-spinner {
				bottom: 0;
				display: none;
				left: 0;
				margin: auto;
				position: absolute;
				right: 0;
				top: 0;
				z-index: 4;
			}

			.change-image-loading d2l-loading-spinner,
			.loading-overlay-shown .loading-overlay d2l-loading-spinner {
				display: flex;
			}

			.change-image-success d2l-loading-spinner,
			.change-image-failure d2l-loading-spinner {
				display: flex;
				opacity: 0;
			}

			.icon-container {
				display: none;
			}

			.change-image-loading .icon-container,
			.change-image-success .icon-container,
			.change-image-failure .icon-container {
				align-items: center;
				background-color: white;
				border-radius: 100px;
				border-style: none;
				bottom: 0;
				display: flex;
				height: 80px;
				justify-content: center;
				left: 0;
				margin: auto;
				overflow: hidden;
				position: absolute;
				right: 0;
				top: 0;
				width: 80px;
			}

			@keyframes inner {
				0% { transform: scale(1); }
				15% { transform: scale(1.8); }
				20% { transform: scale(1.5); }
				100% { transform: scale(1.5); }
			}

			@keyframes container {
				0% { height: 80px; width: 80px; }
				70% { height: 80px; width: 80px; opacity: 1; }
				90% { height: 100px; width: 100px; opacity: 0.4 }
				100% { height: 20px; width: 20px; opacity: 0; }
			}

			.checkmark {
				color: var(--d2l-color-olivine);
				display: none;
			}

			.fail-icon {
				color: #ffce51;
				display: none;
			}

			.change-image-success,
			.change-image-failure,
			.change-image-loading {
				pointer-events: none;
			}

			.change-image-success .checkmark,
			.change-image-failure .fail-icon {
				animation-duration: 1s;
				animation-fill-mode: forwards;
				animation-name: inner;
				display: flex;
			}

			.change-image-success .icon-container,
			.change-image-failure .icon-container {
				animation-duration: 1s;
				animation-fill-mode: forwards;
				animation-name: container;
			}

			.change-image-loading .loading-overlay,
			.change-image-success .loading-overlay,
			.change-image-failure .loading-overlay {
				background-color: rgba(0, 0, 0, 0.4);
				display: block;
				height: 100%;
				opacity: 1;
				position: relative;
				width: 100%;
				z-index: 2;
			}
		</style>
	</template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
