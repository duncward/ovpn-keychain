#!/usr/bin/env node

import * as speakeasy from "speakeasy";
import * as keytar from "keytar";
import { spawn, ChildProcess } from "child_process";

interface Credentials {
  user: string;
  pass: string;
  token: string;
}

interface ProcessOutput {
  stdout: string;
  stderr: string;
  exit: number | null;
}

export const ovpn = (
  spawn_arg: string[],
  setup: Function | null = null,
  stdout: Function | null = null
): Promise<ProcessOutput> => {
  const spawn_exe =
    "/Library/Frameworks/OpenVPN.framework/Versions/Current/bin/ovpncli";
  let strstdout = "";
  let stderr = "";
  const promise = new Promise<ProcessOutput>(function (resolve) {
    const spawned = spawn(spawn_exe, spawn_arg);
    if (setup !== null) {
      setup(spawned);
    }
    spawned.stdout.on("data", (dataBytes) => {
      const data = dataBytes.toString();
      if (stdout !== null) {
        stdout(spawned, data);
      }
      strstdout = strstdout + data;
    });
    spawned.stderr.on("data", (data) => {
      stderr = stderr + data.toString();
    });
    spawned.on("close", () => {
      resolve({
        stdout: strstdout,
        stderr: stderr,
        exit: spawned.exitCode,
      });
    });
  });
  return promise;
};

const getCreds = async (): Promise<Credentials> => {
  return new Promise<Credentials>((resolve, reject) => {
    Promise.all([
      keytar.getPassword("cloudev", "okta"),
      keytar.getPassword("vpn", "2sv"),
    ])
      .then((value: [string | null, string | null]): void | PromiseLike<
        void
      > => {
        const creds = value[0] === null ? null : JSON.parse(value[0]);
        const vpntoken = speakeasy.totp({
          secret: value[1]?.toString() || "",
          encoding: "base32",
        });
        resolve({ user: creds.user, pass: creds.pass, token: vpntoken });
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const reconnect = async (): Promise<void> => {
  console.log("Checking status");
  const status = await ovpn(["status"]);
  const online = /Connection to [^ ]* established via UDP using VPN IP [0-9\.]* with duration [0-9:]*/;
  if (status.stdout.match(online)) {
    console.log(status.stdout);
    return;
  }
  console.log("Reconnecting, getting credentials");
  const cred = await getCreds();
  const setup = (spawn: ChildProcess) => {
    if (spawn.stdin === null) {
      return;
    }
    spawn.stdin.write((cred.token as string) + "\n");
  };
  console.log(await ovpn(["disconnect"]));
  console.log(await ovpn(["-u", cred.user, "-p", cred.pass, "connect"], setup));
};
reconnect().catch((err) => {
  console.log(err);
});
//#➜  duncan.ward /Library/Frameworks/OpenVPN.framework/Versions/Current/bin/ovpncli status
//#Connection to duncan.ward@uberflip.com@devvpn.cdntwrk.com established via UDP using VPN IP 172.27.224.206 with duration 0:01:05
//#➜  duncan.ward /Library/Frameworks/OpenVPN.framework/Versions/Current/bin/ovpncli disconnect
//#1 connection(s) disconnected
//#➜  duncan.ward /Library/Frameworks/OpenVPN.framework/Versions/Current/bin/ovpncli status
//#Disconnected/DELETE_PENDING
