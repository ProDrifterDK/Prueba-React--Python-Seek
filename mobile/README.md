# Task Management System - Mobile App

This is the mobile application for the Task Management System, built with React Native.

## Features

- User authentication (register, login, logout)
- Create, read, update, and delete tasks
- Filter tasks by status (to do, in progress, completed)
- View task statistics
- Cross-platform (iOS and Android)

## Prerequisites

- Node.js (v14+)
- npm or yarn
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/task-management-system.git
   cd task-management-system/mobile
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the mobile directory with the following variables:
   ```
   API_URL=http://localhost:8000
   ```

## Running the Application

### iOS

```
npx react-native run-ios
```

### Android

```
npx react-native run-android
```

## Project Structure

```
mobile/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/             # Screen components
│   ├── services/            # API services
│   └── utils/               # Utility functions
├── App.js                   # Main application component
├── package.json             # Project dependencies and scripts
└── README.md                # Project documentation
```

## Shared Code with Web Frontend

The mobile app shares code with the web frontend, particularly:

- API services
- Authentication logic
- Data models
- Utility functions

This reduces code duplication and ensures consistent behavior across platforms.

## Dependencies

- **React Native**: Framework for building native apps using React
- **React Navigation**: Routing and navigation for React Native apps
- **React Native Paper**: Material Design components for React Native
- **Axios**: Promise-based HTTP client
- **React Native Chart Kit**: Charting library for React Native
- **React Native Vector Icons**: Customizable icons for React Native

## Building for Production

### Android

1. Generate a signing key:
   ```
   keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Create a `gradle.properties` file with your signing configuration.

3. Build the APK:
   ```
   cd android
   ./gradlew assembleRelease
   ```

### iOS

1. Configure your app in Xcode.

2. Build the app for distribution:
   ```
   npx react-native run-ios --configuration Release
   ```

## Testing

```
npm test
```

This will run the test suite using Jest.

## Deployment

### Google Play Store

1. Create a Google Play Developer account.
2. Create a new application in the Google Play Console.
3. Upload your signed APK or Android App Bundle.
4. Fill in the store listing details.
5. Submit for review.

### Apple App Store

1. Create an Apple Developer account.
2. Create a new application in App Store Connect.
3. Configure your app in Xcode.
4. Archive and upload your app using Xcode.
5. Fill in the store listing details.
6. Submit for review.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License.