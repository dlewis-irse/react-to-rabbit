import { connectRabbitMQ } from './connection.js';
import amqp from 'amqplib';

describe('connectRabbitMQ', () => {
  let mockConnect, mockChannel;

  beforeEach(() => {
    mockChannel = {
      assertExchange: jest.fn()
    };

    mockConnect = jest.spyOn(amqp, 'connect').mockResolvedValue({
      createChannel: jest.fn().mockResolvedValue(mockChannel)
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should establish a connection to RabbitMQ', async () => {
    await connectRabbitMQ();
    expect(mockConnect).toHaveBeenCalledWith(expect.any(String));
  });

  it('should assert the required exchanges', async () => {
    await connectRabbitMQ();
    expect(mockChannel.assertExchange).toHaveBeenCalledWith('requests', 'direct', { durable: true });
    expect(mockChannel.assertExchange).toHaveBeenCalledWith('responses', 'direct', { durable: true });
  });

  it('should throw an error if connection fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockConnect.mockRejectedValue(new Error('Connection failed'));
    await expect(connectRabbitMQ()).rejects.toThrow('Connection failed');
    consoleErrorSpy.mockRestore();
  });
});
