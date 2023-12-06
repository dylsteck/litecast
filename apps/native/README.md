# [Native] Available commands

- `dev`: Run start script
- `start`: Starts the development server with ios simulator
- `prebuild`: Generate native source code
- `start:all`: Starts the development server with ios, android simulator
- `ios:build:local`: Build ios app on local environment
- `ios:build:eas`: Build ios app on EAS
- `android:build:local`: Build android app on local environment
- `android:build:eas`: Build android app on EAS
- `eas:resignADHOC`: Codesign an existing .ipa for iOS to a new ad hoc provisioning profile.
- `detox:android:debug:build`: Build android development environment e2e app 
- `detox:android:debug:test`: Run e2e android development environment
- `detox:android:release:build`: Build android production environment e2e app
- `detox:android:release:test`: Run e2e android production environment
- `detox:ios:debug:build`: Build ios development environment e2e app
- `detox:ios:debug:test`: Run e2e ios development environment
- `detox:ios:release:build`: Build ios production environment e2e app
- `detox:ios:release:test`: Run e2e ios production environment
- `lint`: Lints the code using ESLint
- `clean`: Clear build outputs

# Troubleshooting

<details>
<summary>Only Android is failed to request localhost</summary>
<p>

Use ADB reverse to bind an emulator port to a port on your computer.

```shell
   adb reverse tcp:3000 tcp:3000
```

</p>
</details>

<details>
<summary>The transition movement of post thumbnail is unnatural on native</summary>
<p>

We are using Shared Element Transitions powered by React Native Reanimated.
and It is an experimental feature, not recommended for production use yet.
we're just trying it out!

</p>
</details>
