var React = require('react-native');
var Directions = require('./Directions.io.js');
var Map = require('./Map.io.js');

var {
  View,
  StyleSheet
} = React;

let styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 30,
    marginTop: 65,
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#ffffff'
  }
});

class MapDashBoard extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Directions />
        <View style={styles.map}>
          <Map />
        </View>
      </View>
    );
  }
}

module.exports = MapDashBoard;