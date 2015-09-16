'use strict';

import React from 'react-native';
import FBSDKCore from 'react-native-fbsdkcore';
import FBSDKLogin from 'react-native-fbsdklogin';
import NavigationBar from 'react-native-navbar';
import { Icon } from 'react-native-icons';

import Main from '../main/Main';

import NavigationPrev from '../navigation/Custom-Prev';
import NavigationNext from '../navigation/Custom-Next';
import Walkthrough from './Walkthrough';
import CameraDashboard from '../camera/Camera-Dashboard';

import globals from '../../../globalVariables';
import firebase_api from '../../utils/firebase-api';

var {
  StyleSheet,
  AlertIOS,
  View,
  TouchableHighlight,
  TouchableOpacity,
  Text,
  Image
} = React;

var {
  FBSDKLoginManager,
} = FBSDKLogin;


var {
  FBSDKAccessToken,
  FBSDKGraphRequest
} = FBSDKCore;

 class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      responseToken: false,
    };
  }

  async getAccesToken(updateUserInfo) {
    let _this = this;
    var responseToken = await (FBSDKAccessToken.getCurrentAccessToken((token) => {

      if(!token) {
        this.setState({responseToken: true});
        console.warn('No token founded');
        return;
      }

      // GraphQL query for user information
      let fetchProfileRequest = new FBSDKGraphRequest((error, userInfo) => {

        if (error) {
          console.warn('FBSDKGraphRequest', error);
          AlertIOS.alert(
            'Error logging in. Please try again.',
            [
              {text: 'OK', onPress: () => {}},
            ]
          );
          this.setState({responseToken: true});
          return;
        }

        if(updateUserInfo) {
          firebase_api.addUser(userInfo);
        }

        this.props.route.props.onLogin(userInfo);
        this.switchToMain();

      }, 'me?fields=first_name,last_name,picture');

      fetchProfileRequest.start(0);
    }));
  }

  componentDidMount() {
    this.getAccesToken(false);
  }

  onLoginBtnPress() {
    // Shows transition between login and Main screen
    this.setState({responseToken: false});
    FBSDKLoginManager.setLoginBehavior('native');
    FBSDKLoginManager.setDefaultAudience('friends');
    FBSDKLoginManager.logInWithReadPermissions([], (error, result) => {
      if (error) {
        alert('Error logging in.');
      } else {
        if (result.isCanceled) {
          alert('Login cancelled.');
        } else {
          this.setState({result});
          this.getAccesToken(true);
        }
      }
    });
  };

  onLogOut() {
    this.setState({responseToken: true});
  }

  onCameraBtnPress(navigator, route) {
    navigator.push({
      title: 'Camera',
      component: CameraDashboard,
      navigationBar: (
        <NavigationBar
          title="Picture Time" />
      )
    });
  }

  onTourStart() {
    this.props.navigator.push({
      component: Walkthrough,
      props: {
        isSignedIn: false
      }
    });
  }

  switchToMain(userInfo) {
    this.props.navigator.push({
      component: Main,
      props: {
        onLogOut: this.onLogOut.bind(this),
        onMenuToggle: this.props.route.props.onMenuToggle
      },
      navigationBar: (
        <NavigationBar
          customPrev={<NavigationPrev handler={this.props.route.props.onMenuToggle} iconName={'navicon'} size={37} color={globals.primaryLight}/>}
          title="Mystery Meal"
          titleColor={globals.darkText}
          customNext={<NavigationNext handler={this.onCameraBtnPress.bind(this, this.props.navigator, this.props.route)} iconName={'ios-camera-outline'} size={37} color={globals.lightText} />}
          style={styles.navigator} />
      )
    });
  }

  render() {
    // this page appears after login process and before main screen
    // will be replaced by a loading screen
    if (!this.state.responseToken) {
      return (
        <Text></Text>
      );
    }

    return (
      <View
        style={styles.container}>
        <Image
          source={require('image!food-bg')}
          style={styles.loginImage}>
          <View style={styles.textContainer}>
            <Text style={[styles.text, styles.headline]}>Mmmystery</Text>
            <Text style={[styles.text, styles.subHeadline]}>
              A fun way of discovering new restaurants and your next favorite meal!
            </Text>
          </View>
          <View style={styles.loginContainer}>
            <TouchableHighlight
              underlayColor={globals.primaryDark}
              style={styles.loginButton}
              onPress={this.onLoginBtnPress.bind(this)}>
              <View style={styles.innerBtn}>
                <Icon
                  name='ion|social-facebook-outline'
                  size={30}
                  color='#ffffff'
                  style={styles.icon}
                />
                <Text style={[styles.text]}>Sign in with
                  <Text style={styles.emphasis}> Facebook</Text>
                </Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight
              underlayColor='#FFBF00'
              onPress={this.onTourStart.bind(this)}>
              <Text style={[styles.text]}>Take a Tour</Text>
            </TouchableHighlight>
          </View>
        </Image>
      </View>
    );
  }
};

export default Login;

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headline: {
    marginBottom: 50,
    fontFamily: 'SanFranciscoDisplay-Semibold',
    fontSize: 40,
  },
  subHeadline: {
    textAlign: 'center',
    fontSize: 25,
  },
  loginContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 50,
  },
  innerBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  loginButton: {
    width: 295,
    height: 67,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    borderRadius: 30,
    borderColor: '#ffffff',
    borderWidth: 1,
    backgroundColor: globals.primary,
  },
  text: {
    fontFamily: 'SanFranciscoDisplay-SemiBold',
    color: '#ffffff',
    fontSize: 20,
  },
  emphasis: {
    fontWeight: 'bold',
  },
  loginImage: {
    flex: 1,
    overflow: 'visible'
  },
});
