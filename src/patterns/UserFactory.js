class UserFactory {
  static create({ name, rut, email, passwordHash, wantsQuestionnaire }) {
    const role = wantsQuestionnaire ? 'usuario_voluntario' : 'usuario_pedido';

    return {
      name,
      rut,
      email,
      passwordHash,
      role,
      profileCompleted: !wantsQuestionnaire
    };
  }
}

module.exports = UserFactory;
