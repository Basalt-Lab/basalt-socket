# Changelog

## [1.3.2](https://github.com/Basalt-Lab/basalt-socket/compare/v1.3.1...v1.3.2) (2023-12-12)


### Bug Fixes

* change path import ([c58c04b](https://github.com/Basalt-Lab/basalt-socket/commit/c58c04b1661b64067141cded6106ec7c76000f8d))

## [1.3.1](https://github.com/Basalt-Lab/basalt-socket/compare/v1.3.0...v1.3.1) (2023-12-12)


### Code Refactoring

* improvement JsDoc and folder structure ([3c5bad6](https://github.com/Basalt-Lab/basalt-socket/commit/3c5bad66a44b07a9ab9e60305dd3f5b2f7f9f99b))


### Build System

* update package versions ([ffd72f1](https://github.com/Basalt-Lab/basalt-socket/commit/ffd72f195b8e698b76da00660722576a3faa03ea))


### Continuous Integration

* update node version ([b0b1073](https://github.com/Basalt-Lab/basalt-socket/commit/b0b10733221ab793a2a89b447e1e029319a83964))

## [1.3.0](https://github.com/Basalt-Lab/basalt-socket/compare/v1.2.0...v1.3.0) (2023-11-28)


### Features

* add ListenOptions and add Hostname property ([b245d8b](https://github.com/Basalt-Lab/basalt-socket/commit/b245d8b0cee2f7ad5fb6aec08820cebb4b983f39))
* use can be take multiple events ([e4ab852](https://github.com/Basalt-Lab/basalt-socket/commit/e4ab852abc202516ede37aa107c932a81ddfc0a8))


### Code Refactoring

* simplify use ([f90719c](https://github.com/Basalt-Lab/basalt-socket/commit/f90719cfefe1a4b0f60a8b7aadda0e9593c14c16))

## [1.2.0](https://github.com/Basalt-Lab/basalt-socket/compare/v1.1.0...v1.2.0) (2023-11-26)


### Features

* Add possibility to have CORS + global improvements ([58173b5](https://github.com/Basalt-Lab/basalt-socket/commit/58173b57ebbe082386ba3309317ec393984a1fc5))


### Bug Fixes

* correction of response overflow + clean _basaltServerOption ([a08bff5](https://github.com/Basalt-Lab/basalt-socket/commit/a08bff567f5277a742d0ad7ad9c1d831e9c702df))
* Correction when we have no origin do not set up the CORS ([c6a2781](https://github.com/Basalt-Lab/basalt-socket/commit/c6a27814b0899efb31588bab409aa30718037f49))


### Build System

* update package-lock ([fde7814](https://github.com/Basalt-Lab/basalt-socket/commit/fde7814bba137a741515d51bd6f81b986224db71))


### Miscellaneous Chores

* add npm ignore Tests/ folder ([d4df6a9](https://github.com/Basalt-Lab/basalt-socket/commit/d4df6a915df484233be3c90df0843d69eaf4fe75))

## [1.1.0](https://github.com/Basalt-Lab/basalt-socket/compare/v1.0.0...v1.1.0) (2023-11-23)


### Features

* add close, publish method and change name ([501dd68](https://github.com/Basalt-Lab/basalt-socket/commit/501dd681c480924cb5c45ba57f72b77944f741b1))


### Bug Fixes

* correction prefix ([75b8cdb](https://github.com/Basalt-Lab/basalt-socket/commit/75b8cdb1dce5cb71edca9b1538f513a98027e5fa))

## 1.0.0 (2023-11-15)


### Features

* Add BasalSocket Server and Event Classes ([4336fa5](https://github.com/Basalt-Lab/basalt-socket/commit/4336fa504ab32af9e330b19e6223963aa2a8fc48))
* Add classes gateway socket io client ([4a74225](https://github.com/Basalt-Lab/basalt-socket/commit/4a74225715e75f9ee31ab8caea8b57c62ec4dece))
* Add Gateway classes ([e86da32](https://github.com/Basalt-Lab/basalt-socket/commit/e86da32168420ce37a3b9bf2273397687a9c8ee2))
* Add Gateway interfaces ([61fe976](https://github.com/Basalt-Lab/basalt-socket/commit/61fe9764cd6e8718c22d434c834add65b5c4dbc3))
* Add interface for gateway socket io client ([c23dbde](https://github.com/Basalt-Lab/basalt-socket/commit/c23dbde1a7a5a3768dcb4918c7a7b1396873e4bd))
* Add interfaces for Basalt Websocket server ([2e4ce47](https://github.com/Basalt-Lab/basalt-socket/commit/2e4ce47b9de03cd821df847e89fbc38c6068e649))
* improvements of BasaltSocketServer ([dabacf8](https://github.com/Basalt-Lab/basalt-socket/commit/dabacf8baccd8e0e85a5f6f05f8430716ad0b215))
* initialization of basalt-socket ([3e4be7b](https://github.com/Basalt-Lab/basalt-socket/commit/3e4be7b0bff46c4cd79d2bbdf8dd12190bd231ff))


### Bug Fixes

* prefix correction add default / -&gt; prefix/eventName ([4969261](https://github.com/Basalt-Lab/basalt-socket/commit/4969261c507466e658981526dfc653926aba4092))
* remove default prefix '/' and allow to empty prefix ([1b2c179](https://github.com/Basalt-Lab/basalt-socket/commit/1b2c1796010bdefc19523bef1d5613a9274e9df3))


### Code Refactoring

* change console.log ([5f5d92f](https://github.com/Basalt-Lab/basalt-socket/commit/5f5d92ff6ff48c708b321ac420a3fe4a8066c29a))
* change name gateway to client ([bc73675](https://github.com/Basalt-Lab/basalt-socket/commit/bc73675f3f3908462a292e687b76b12e39320a98))


### Build System

* add dependencies ([cec2010](https://github.com/Basalt-Lab/basalt-socket/commit/cec20105118479f5db224080fcd29076a37d2c1e))
* Add dependencies socket io client ([e9d34b6](https://github.com/Basalt-Lab/basalt-socket/commit/e9d34b6d1b0bc777108ce43d92929dc015a385b8))
* update dependancies ([da47991](https://github.com/Basalt-Lab/basalt-socket/commit/da479911a9850b34dd1e2559bc740c40e032d88b))
* update dependencies ([67b1faf](https://github.com/Basalt-Lab/basalt-socket/commit/67b1faf41ce6d9e7bc2c8b8de466511675be2f50))
* update dependencies ([a614d0e](https://github.com/Basalt-Lab/basalt-socket/commit/a614d0e3347042604bcb17e7a362e3ab1628d37c))
* Update package json ([d124e87](https://github.com/Basalt-Lab/basalt-socket/commit/d124e876cc10c44f26498ccd1ad533f60670c5b4))


### Continuous Integration

* update release-and-publish github action ([78daf47](https://github.com/Basalt-Lab/basalt-socket/commit/78daf47b207d4c1947b59031375b6a8ae07ca32f))


### Documentation

* write readme ([3226957](https://github.com/Basalt-Lab/basalt-socket/commit/322695778a8fae9f7bebe5246f9b54b82273e521))


### Miscellaneous Chores

* Add keywords ([b51cef7](https://github.com/Basalt-Lab/basalt-socket/commit/b51cef75c44e92b4f3ac74c4287273c17f824aac))
* update npmignore ([e4dc04d](https://github.com/Basalt-Lab/basalt-socket/commit/e4dc04d051a59a0b81890b13633160e7ce078b45))
