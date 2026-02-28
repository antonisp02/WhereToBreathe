# WhereToBreathe
**WhereToBreathe – Air Quality Activity Planner**

WhereToBreathe is a browser-based web application that helps users determine whether it's safe to engage in outdoor activities, based on air quality data and personal sensitivity to pollution. It offers guidance by combining environmental data with interactive tools like maps and calendars.


**What Problem Does It Solve?**

Air pollution poses serious health risks, particularly to vulnerable populations such as the elderly or people with respiratory conditions. However, most available tools only provide raw data without personalized advice. WhereToBreathe addresses this by offering tailored recommendations based on:

  • The user’s selected location within Thessaloniki.
  
  • Their sensitivity to air pollution.
  
  • The air quality conditions on a chosen date.
  
This helps individuals make informed decisions about when and where it is safe to be outdoors.


**How It Works**

Users interact with:
  1. An interactive map of Thessaloniki, selecting one of several predefined areas.
  2. A custom calendar to choose a date.
  3. A sensitivity selector (low, moderate, or high).
Once these selections are made, the app calculates an Air Quality Index (AQI) score and gives a personalized recommendation.



📌 **Note**: At this time, the application includes air quality and weather data only for January 2024.

The AQI calculation uses daily average concentrations of NO₂ (Nitrogen Dioxide), O₃ (Ozone), and SO₂ (Sulfur Dioxide). These values are derived from hourly open data measurements and processed using linear interpolation based on European air quality standards.

**The website is live and ready to use!**

<img width="1920" height="1042" alt="Screenshot of the site" src="https://github.com/user-attachments/assets/fbaeb499-377d-4ba4-be9d-7622a18af5a2" />
