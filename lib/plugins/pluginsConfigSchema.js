'use strict';

const Joi = require('joi');

const BlippPluginConfig = require('./config/blippPluginConfig');
const GoodPluginConfig = require('./config/goodPluginConfig');
const VisionPluginConfig = require('./config/visionPluginConfig');
const InertPluginConfig = require('./config/inertPluginConfig');
const LoutPluginConfig = require('./config/loutPluginConfig');
const PoopPluginConfig = require('./config/poopPluginConfig');
const HapiRouterPluginConfig = require('./config/hapiRouterPluginConfig');

module.exports = {
    blipp: Joi.object().type(BlippPluginConfig).required(),
    good: Joi.object().type(GoodPluginConfig).required(),
    vision: Joi.object().type(VisionPluginConfig).required(),
    inert: Joi.object().type(InertPluginConfig).required(),
    lout: Joi.object().type(LoutPluginConfig).required(),
    poop: Joi.object().type(PoopPluginConfig).required(),
    hapiRouter: Joi.object().type(HapiRouterPluginConfig).required()
};
