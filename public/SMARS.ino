#include <AFMotor.h>
#include <SoftwareSerial.h>

SoftwareSerial mySerial(9, 10); // RX, TX

AF_DCMotor motor1(1);
AF_DCMotor motor2(2);

void setup() {
  motor1.setSpeed(150);
  motor2.setSpeed(150);
  Serial.begin(9600);
  mySerial.begin(9600);
}

void loop() {
  if (mySerial.available()) {
    char d = mySerial.read();
    Serial.println(d);
    if(d == 'F'){
      motor1.run(FORWARD);
      motor2.run(BACKWARD);
    }
    if(d == 'G'){
      motor1.run(BACKWARD);
      motor2.run(FORWARD);
    }
    if(d == 'R'){
      motor1.run(FORWARD);
      motor2.run(FORWARD);
    }
    if(d == 'L'){
      motor1.run(BACKWARD);
      motor2.run(BACKWARD);
    }
    if(d == 'E'){
      motor1.run(FORWARD);
      motor2.run(RELEASE);
    }
    if(d == 'Q'){
      motor1.run(RELEASE);
      motor2.run(BACKWARD);
    }
    if(d == 'C'){
      motor1.run(BACKWARD);
      motor2.run(RELEASE);
    }
    if(d == 'Z'){
      motor1.run(RELEASE);
      motor2.run(FORWARD);
    }
    if(d == 'S'){
      motor1.run(RELEASE);
      motor2.run(RELEASE);
    }
  }
}