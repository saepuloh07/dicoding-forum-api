const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const payloadThread = new AddThread(useCasePayload);
    return this._threadRepository.addThread(payloadThread);
  }
}

module.exports = AddThreadUseCase;
