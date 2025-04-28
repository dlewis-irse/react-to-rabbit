import pika
import json

def test_request_handler(ch, method, properties, body):
    payload = json.loads(body)
    print(f"Processing testRequest with payload: {payload}")

    # Validate reply_to property
    if not properties.reply_to:
        print("Error: Missing reply_to property in message properties.")
        ch.basic_ack(delivery_tag=method.delivery_tag)
        return

    if not isinstance(properties.reply_to, str):
        print(f"Error: Invalid reply_to property type: {type(properties.reply_to)}")
        ch.basic_ack(delivery_tag=method.delivery_tag)
        return

    request_id = payload.get('requestId')
    print(f"Received requestId: {request_id}")

    # Simulate streaming data
    ch.basic_publish(exchange='', routing_key=properties.reply_to, body=json.dumps({"requestId": request_id, "data": "Chunk 1"}))
    print(f"Sent Chunk 1 with requestId: {request_id}")
    ch.basic_publish(exchange='', routing_key=properties.reply_to, body=json.dumps({"requestId": request_id, "data": "Chunk 2"}))
    print(f"Sent Chunk 2 with requestId: {request_id}")

    # Send final data
    ch.basic_publish(exchange='', routing_key=properties.reply_to, body=json.dumps({"requestId": request_id, "data": "Final Chunk", "isFinal": True}))
    print(f"Sent Final Chunk with requestId: {request_id}")
    ch.basic_ack(delivery_tag=method.delivery_tag)

# RabbitMQ connection setup
def main():
    connection = pika.BlockingConnection(pika.ConnectionParameters(
        host='localhost',
        credentials=pika.PlainCredentials('esri_admin', 'esri_password')
    ))
    channel = connection.channel()

    # Declare the queue
    queue_name = 'testRequest'
    channel.queue_declare(queue=queue_name, durable=True)

    # Register the handler
    channel.basic_consume(queue=queue_name, on_message_callback=test_request_handler)

    print("Waiting for messages. To exit press CTRL+C")
    channel.start_consuming()

if __name__ == "__main__":
    main()