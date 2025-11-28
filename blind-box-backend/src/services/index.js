/**
 * 服务层统一导出
 */

const AuthService = require('./AuthService');
const BlindBoxService = require('./BlindBoxService');
const UserService = require('./UserService');

module.exports = {
  AuthService,
  BlindBoxService,
  UserService
};
