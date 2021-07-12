import SceneView from "@arcgis/core/views/SceneView";
import Map from "@arcgis/core/Map";
import esriConfig from "@arcgis/core/config.js";
import { useEffect, useRef, useState } from "react";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import useInterval from "./useInterval";

function App() {
  const container = useRef(null);
  const button = useRef(null);
  const [view, setView] = useState(null);
  const [trackPlane, setTrackPlane] = useState(false);
  const [drone, setDrone] = useState(null);
  const [polyline, setPolyLine] = useState(null);

  esriConfig.apiKey =
    "AAPK998f3a3e95234396851122696e78b82e7pXI3E4TebAbTLrxuG5UbEq1m5aKif8SDSqTFiBVD6tLUdbknziynpHEPe-ioFYj";

  useEffect(() => {
    const drone = new Graphic({
      geometry: {
        type: "point",
        latitude: -7.782929602108119,
        longitude: 110.37764310836793,
        z: 10000,
      },
      symbol: {
        type: "point-3d",
        symbolLayers: [
          {
            type: "object",
            resource: {
              href: process.env.PUBLIC_URL + "/3dmodels/plane.glb",
            },
            material: {
              color: {
                r: 254,
                g: 309,
                b: 3,
                a: 1,
              },
            },
          },
        ],
      },
    });

    const polyline = new Graphic({
      geometry: {
        type: "polyline",
        paths: [[110.37764310836793, -7.782929602108119, 10000]],
      },
      symbol: {
        type: "simple-line",
        color: [35, 49, 90],
        width: 4,
      },
    });
    setDrone(drone);
    setPolyLine(polyline);

    const droneLayer = new GraphicsLayer({
      graphics: [drone, polyline],
    });

    const map = new Map({
      basemap: "satellite",
      ground: "world-elevation",
    });

    const view = new SceneView({
      container: container.current,
      map: map,
      camera: {
        position: [110.37764310836793, -7.771279602108119, 500],
        heading: 0.51,
        tilt: 0,
      },
      ui: { components: [] },
    });

    map.add(droneLayer);

    setView(view);

    return () => {
      view && droneLayer.removeAll();
      view.map && view.map.removeAll();
      view && view.destroy();
    };
  }, [setView]);
  console.log(polyline);

  const id = useInterval(() => {
    if (drone) {
      console.log("drone.geometry.long: (old)", drone.geometry.longitude);
      const droneSymbol = drone.symbol.clone();
      const droneGeo = drone.geometry.clone();
      droneGeo.longitude -= 0.001;
      console.log("droneGeo.long:", droneGeo.longitude);
      drone.symbol = droneSymbol;
      drone.geometry = droneGeo;
      console.log("drone.geometry.long: (new)", drone.geometry.longitude);
      console.log(drone.geometry.longitude);
      if (polyline) {
        console.log(polyline.geometry.paths);
        const newLine = polyline.clone();
        newLine.geometry.paths[0].push([
          droneGeo.longitude,
          droneGeo.latitude,
          droneGeo.z,
        ]);
        polyline.geometry = newLine.geometry;
        polyline.symbol = newLine.symbol;
      }
      if (view && trackPlane) {
        // console.log("z : ", view.camera.position.z);
        // const camera = view.camera.clone();
        // camera.position = {
        //   latitude: drone.geometry.latitude,
        //   longitude: drone.geometry.longitude,
        //   z: view.camera.position.z,
        // };
        // camera.heading = view.camera.heading;
        // camera.position.longitude = drone.geometry.longitude;
        // camera.position.latitude = drone.geometry.latitude;
        // camera.position.z = 50000;
        // camera.heading = -90;
        // camera.tilt = 0;
        // view.goTo(camera, { animate: false });
        view.goTo(
          {
            center: drone,
            heading: view.camera.heading,
            // position: camera,
          },
          { animate: false }
        );
      }
    }
  });

  // setTimeout(() => {
  //   clearInterval(id);
  // }, 10000);

  return (
    <>
      <div ref={container} style={{ height: "100vh", width: "100vw" }} />
      <div
        ref={button}
        style={{
          height: "40px",
          width: "120px",
          position: "absolute",
          bottom: 50,
          left: 30,
          background: "gray",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 10,
        }}
        onClick={() => {
          setTrackPlane(!trackPlane);
        }}
      >
        track plane
      </div>
    </>
  );
}

export default App;
