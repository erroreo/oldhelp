#include <SPI.h>
#include <WiFiNINA.h>
#include <MySQL_Connection.h>
#include <MySQL_Cursor.h>
#include <RH_ASK.h> 
#include <stdlib.h>
#include <stdio.h>
#define heartratePin A1
#include "DFRobot_Heartrate.h"

DFRobot_Heartrate heartrate(DIGITAL_MODE);
byte mac_addr[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };
int Sensor = 2;     // RCWL-0516 Input Pin
int LED = 13;       // Output LED
int sensorval = 0;  // RCWL-0516 Sensor Value
String str_out;   // Output String
 // 宣告字元陣列

// Create Amplitude Shift Keying Object
RH_ASK rf_driver;
IPAddress server_addr(120,105,161,167);  // IP of the MySQL *server* here
char user[] = "root";              // MySQL user login username
char password[] = "4niufmNznRsXj1oT";        // MySQL user lˇogin password

// WiFi card example
char ssid[] = "James";    // your SSID
char pass[] = "0982380847";       // your SSID Password

WiFiClient client;
char server[] = "www.google.com";
MySQL_Connection conn((Client *)&client);
int count=0;
void setup() {
  
  Serial.begin(9600);
  rf_driver.init(); // Initialize ASK Object
  pinMode (Sensor, INPUT);  //RCWL-0516 as input
  pinMode (LED, OUTPUT);    //LED as OUTPUT
  digitalWrite(LED, LOW);  // Turn LED Off
  while (!Serial); // wait for serial port to connect
  // Begin WiFi section
  int status = WiFi.begin(ssid, pass);
  if ( status != WL_CONNECTED) {
    Serial.println("Couldn't get a wifi connection");
    while(true);
  }
  // print out info about the connection:
  else {
    Serial.println("Connected to network");
    IPAddress ip = WiFi.localIP();
    Serial.print("My IP address is: ");
    Serial.println(ip);
  }
  // End WiFi section
  Serial.println("Connecting...");
  if (conn.connect(server_addr, 3306, user, password)) {
    delay(1000);
     Serial.println("OK!!!!!!!!!!!!!!!!");
  }
  else{
    Serial.println("Connection failed.");
  conn.close();
  }
  
}

void loop() {
  
  uint8_t rateValue;
  heartrate.getValue(heartratePin); ///< A1 foot sampled values
  rateValue = heartrate.getRate(); ///< Get heart rate value 
  int a = rateValue;
  if(rateValue)  {
    char b [5];
    sprintf(b,"%d",rateValue);
    Serial.println(rateValue);
    char INSERT_SQL[] = "INSERT INTO jamesdatabase.heartdata (heartbeat) VALUES (";
    strcat(INSERT_SQL,b);
    strcat(INSERT_SQL,");");
    char TRUNCATE_SQL[] = "TRUNCATE `jamesdatabase`.`heartdata`";
    MySQL_Cursor *cur_mem = new MySQL_Cursor(&conn);
    if(count>10){
      cur_mem->execute(TRUNCATE_SQL);
      count=0;
    }
    count++;
    cur_mem->execute(INSERT_SQL);
    delete cur_mem;
  }
  delay(20);
}