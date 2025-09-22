app
.controller('DrawerCtrl', ['$scope', "asyncValidator", function ExperimentalCtrl($scope, asyncValidator) {
    const _that = this

    // Drawer state
    this.drawerOne={
        direction: 'ltr',
        model: false
    }
    this.drawerTow={
        direction: 'rtl',
        model: false
    }
    this.drawerThree= {
        direction: 'ttb',
        model: false
    }
    this.drawerFour={
        direction: 'btt',
        model: false
    }

    // Form data
    this.formData = {
        name: '',
        email: '',
        message: ''
    }

    // Original model (keeping existing functionality)
    this.model = {
        num: '',
        result: ''
    }
    // Drawer state
    this.drawerOneInnerR={
        direction: 'ltr',
        model: false
    }

    // Drawer state
    this.drawerOneInnerL={
        direction: 'ltr',
        model: false
    }

    this.inputChange = function() {
        // Existing functionality
    }

    // Drawer methods
    this.drawerOneFn = function() {
        this.drawerOne.model = !this.drawerOne.model
    }
    this.drawerOneInnerFn1 = function() {
        this.drawerOneInnerR.model = !this.drawerOneInnerR.model
    }


    this.drawerTwoFn = function() {
        this.drawerTow.model = !this.drawerTow.model
    }

    this.drawerThreeFn = function() {
        this.drawerThree.model = !this.drawerThree.model
    }

    this.drawerFourFn = function() {
        this.drawerFour.model = !this.drawerFour.model
    }

    this.saveForm = function() {
        console.log('Form data:', this.formData)
        alert('Form saved! Check console for data.')
        this.closeDrawer()
    }
}])
